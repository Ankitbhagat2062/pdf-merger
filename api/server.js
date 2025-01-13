import multer from "multer";
import path from "path";
import { mergePdfs } from "../../merge.js"; // Adjust the import to your file location
import { rimraf } from "rimraf";
import fs from "fs/promises";
import pdfjsLib from "pdfjs-dist";

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

      // Parse the selected pages and file information
      const selectedPages = JSON.parse(req.body.selectedPages || "[]");
      if (!selectedPages.length) {
        return res.status(400).send("No pages selected for merging.");
      }

      // Map uploaded files to their temporary paths
      const uploadedFiles = req.files.reduce((acc, file) => {
        acc[file.originalname] = file.path;
        return acc;
      }, {});

      // Load PDF files and render pages
      const renderedPages = await Promise.all(
        selectedPages.map(async ({ fileName, pageNum }) => {
          const filePath = uploadedFiles[fileName];
          if (!filePath) throw new Error(`File ${fileName} not found.`);

          const pdf = await pdfjsLib.getDocument(filePath).promise;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });

          // Render page to a canvas
          const canvas = createCanvas(viewport.width, viewport.height);
          const context = canvas.getContext("2d");
          await page.render({ canvasContext: context, viewport }).promise;

          return canvas.toBuffer("image/png"); // Convert to PNG for preview
        })
      );

      // Serve the rendered pages as a response
      res.status(200).json({ renderedPages });

      // Clean up uploaded files
      Object.values(uploadedFiles).forEach((filePath) => {
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
