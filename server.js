import multer from "multer";
import path from "path";
import { mergePdfs } from "./api/merge.js"; // Adjust the import to your file location
import { rimraf } from "rimraf";
import fs from "fs/promises";

const upload = multer({ dest: "/tmp/uploads/", limits: { fileSize: 50 * 1024 * 1024 } });

export const config = {
  api: {
    bodyParser: false, // Disable default body parser as we use multer
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const multerPromise = new Promise((resolve, reject) => {
      upload.array("pdfs", 12)(req, {}, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // Wait for file upload to complete
      await multerPromise();

      // Merge the uploaded PDFs
      const filePaths = req.files.map((file) => file.path);
      const mergedPdfPath = path.join("/tmp", "merged.pdf");
      await mergePdfs(filePaths, mergedPdfPath);

      // Serve the merged PDF as a response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=merged.pdf");
      const mergedPdf = await fs.readFile(mergedPdfPath);
      res.status(200).send(mergedPdf);

      // Clean up temporary files
      [...filePaths, mergedPdfPath].forEach((filePath) => {
        rimraf(filePath).catch(console.error);
      });
    } catch (error) {
      console.error("Error handling request:", error.message);
      res.status(500).send(`An error occurred: ${error.message}`);
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
