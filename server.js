import multer from "multer";
import path from "path";
import { mergePdfs } from "../../merge.js";
import { rimraf } from "rimraf";
import fs from "fs/promises";

const upload = multer({ dest: "/tmp/uploads/", limits: { fileSize: 50 * 1024 * 1024 } });

export const config = {
  api: {
    bodyParser: false,
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
      await multerPromise();

      const selectedPages = JSON.parse(req.body.selectedPages || "[]");
      if (!selectedPages.length) {
        return res.status(400).send("No pages selected for merging.");
      }

      const uploadedFiles = req.files.reduce((acc, file) => {
        acc[file.originalname] = file.path;
        return acc;
      }, {});

      const orderedFiles = selectedPages.map(({ fileName, pageNum }) => {
        const uploadedFilePath = uploadedFiles[fileName];
        if (!uploadedFilePath) {
          throw new Error(`Uploaded file '${fileName}' not found.`);
        }
        return { path: uploadedFilePath, range: pageNum };
      });

      const mergedDir = path.join(process.cwd(), "merged_files");
      await fs.mkdir(mergedDir, { recursive: true });

      const mergedFileName = `merged_${Date.now()}.pdf`;
      const outputFilePath = path.join(mergedDir, mergedFileName);

      await mergePdfs(orderedFiles, outputFilePath);

      return res.redirect(302, `/merged_files/${mergedFileName}`);
    } catch (error) {
      console.error("Error merging PDFs:", error.message);
      res.status(500).send(`An error occurred while merging PDFs: ${error.message}`);
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
