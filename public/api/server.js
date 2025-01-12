import multer from "multer";
import path from "path";
import { mergePdfs } from "./merge"; // Adjust the import to your file location
import { rimraf } from "rimraf";
import fs from "fs/promises";

const upload = multer({ dest: "/tmp/uploads/", limits: { fileSize: 50 * 1024 * 1024 } });

export const config = {
  api: {
    bodyParser: false, // Disable default body parser as we use multer
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Logic for processing the file upload and merging...
    res.status(200).send({ success: true, message: "Merge completed!" });
  } catch (error) {
    console.error("Serverless Function Error:", error); // Log the error
    res.status(500).send({ error: "An internal server error occurred." });
  }
  if (req.method === "POST") {
    // Middleware for file upload
    const multerPromise = new Promise((resolve, reject) => {
      upload.array("pdfs", 12)(req, {}, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // Wait for multer to complete
      await multerPromise();

      // Get selected pages from request body
      const selectedPages = JSON.parse(req.body.selectedPages || "[]");
      if (!selectedPages.length) {
        return res.status(400).send("No pages selected for merging.");
      }

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

      // Generate merged file name
      let mergedFileName = "merged";
      req.files.forEach((file) => {
        mergedFileName += `_${file.originalname.replace(".pdf", "")}`;
      });
      mergedFileName += `_${Date.now()}.pdf`;

      // Set the output path in the /tmp directory (Vercel's writable temp storage)
      const outputFilePath = path.join("/tmp", mergedFileName);

      // Merge PDFs
      await mergePdfs(orderedFiles, outputFilePath);

      // Serve the merged file
      const fileBuffer = await fs.readFile(outputFilePath);
      res.setHeader("Content-Disposition", `attachment; filename=${mergedFileName}`);
      res.setHeader("Content-Type", "application/pdf");
      res.send(fileBuffer);

      // Clean up the merged file after serving
      setTimeout(() => {
        rimraf(outputFilePath).catch(console.error);
      }, 20 * 1000); // Delay file deletion by 20 seconds
    } catch (error) {
      console.error("Error merging PDFs:", error.message);
      res.status(500).send(`An error occurred while merging PDFs: ${error.message}`);
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}