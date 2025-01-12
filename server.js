import multer from "multer";
import path from "path";
import { mergePdfs } from "../merge.js";  // Adjust this import based on your project structure
import { rimraf } from 'rimraf';
import fs from "fs/promises";
const upload = multer({ dest: "uploads/", limits: { fileSize: 50 * 1024 * 1024 } });
export const config = {
  api: {
    bodyParser: false, // Disable default body parser as we use multer
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
       // Middleware for file upload
    const multerPromise = new Promise((resolve, reject) => {
      upload.array("pdfs", 12)(req, {}, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      const selectedPages = JSON.parse(req.body.selectedPages || "[]");
      if (!selectedPages.length) {
        return res.status(400).send("No pages selected for merging.");
      }

      // Handle file uploads and merging logic here

      // Map uploaded files
      const uploadedFiles = req.files.reduce((acc, file) => {
        acc[file.originalname] = file.path;
        return acc;
      }, {});

      // Create ordered files based on selected pages
      const orderedFiles = selectedPages.map(({ fileName, pageNum }) => {
        const uploadedFilePath = uploadedFiles[fileName];
        if (!uploadedFilePath) {
          throw new Error(`Uploaded file '${fileName}' not found.`);
        }
        return { path: uploadedFilePath, range: pageNum };
      });

      // Set a unique file name for the merged PDF
      let mergedFileName = "merged";
      req.files.forEach((file) => (mergedFileName += `_${file.originalname.replace(".pdf", "")}`));
      mergedFileName += `_${Date.now()}.pdf`;

      const outputFilePath = path.join(__dirname, "public", "merged_files", mergedFileName);

      await mergePdfs(selectedPages, outputFilePath);  // Merge the selected pages

      // Return the merged file URL as JSON response
      res.status(200).json({ mergedFileUrl: `/merged_files/${mergedFileName}` });
  // Serve the merged file
      const fileBuffer = await fs.readFile(outputFilePath);
      res.setHeader("Content-Disposition", `attachment; filename=${mergedFileName}`);
      res.setHeader("Content-Type", "application/pdf");
      res.send(fileBuffer);

      setTimeout(() => {
        rimraf(outputFilePath, (err) => {
          if (err) console.error("Failed to delete merged PDF", err);
          else console.log("Merged PDF deleted successfully");
        });
      }, 20 * 1000);  // Delete after 20 seconds

    } catch (error) {
      console.error("Error merging PDFs:", error);
      res.status(500).json({ message: "An error occurred while merging PDFs." });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
