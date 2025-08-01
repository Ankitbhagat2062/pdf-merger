import formidable from "formidable";
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib"; // or your mergePdfs helper

// ⛔ Disable default body parsing (needed for file uploads)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to merge PDFs in memory
async function mergePdfs(orderedFiles) {
  const mergedPdf = await PDFDocument.create();

  for (const { filePath, range } of orderedFiles) {
    const fileData = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(fileData);

    let pagesToCopy = [];
    if (Array.isArray(range) && range.length > 0) {
      // Custom selected pages
      range.forEach((pageNum) => {
        if (pageNum > 0 && pageNum <= pdf.getPageCount()) {
          pagesToCopy.push(pageNum - 1); // 0-based index
        }
      });
    } else {
      // All pages
      pagesToCopy = pdf.getPageIndices();
    }

    const copiedPages = await mergedPdf.copyPages(pdf, pagesToCopy);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ multiples: true, maxFileSize: 50 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      const selectedPages = JSON.parse(fields.selectedPages || "[]");

      // Map uploaded files
      const uploadedFiles = {};
      (Array.isArray(files.pdfs) ? files.pdfs : [files.pdfs]).forEach((file) => {
        uploadedFiles[file.originalFilename] = file.filepath;
      });

      const orderedFiles = selectedPages.map(({ fileName, pageNum }) => {
        const uploadedFilePath = uploadedFiles[fileName];
        if (!uploadedFilePath) {
          throw new Error(`Uploaded file '${fileName}' not found.`);
        }
        return { filePath: uploadedFilePath, range: pageNum };
      });

      // ✅ Merge PDFs in memory
      const mergedPdfBytes = await mergePdfs(orderedFiles);

      // Send merged PDF back as a download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="merged_${Date.now()}.pdf"`
      );
      res.send(Buffer.from(mergedPdfBytes));
    });
  } catch (error) {
    console.error("Error merging PDFs:", error.message);
    res.status(500).send(`An error occurred while merging PDFs: ${error.message}`);
  }
}
