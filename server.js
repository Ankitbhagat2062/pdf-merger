import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { mergePdfs } from "./merge.js";
import { rimraf } from 'rimraf';

const app = express();
const upload = multer({ dest: "uploads/", limits: { fileSize: 50 * 1024 * 1024 }, });

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));


// app.post("/api/merge", upload.array("pdfs", 12), async (req, res) => {
//   try {
//     console.log("Request Body:", req.body);
//     console.log("Uploaded Files:", req.files);

//     const selectedPages = JSON.parse(req.body.selectedPages || "[]");
//     if (!selectedPages.length) {
//       return res.status(400).send("No pages selected for merging.");
//     }

//     const uploadedFiles = req.files.reduce((acc, file) => {
//       acc[file.originalname] = file.path;
//       return acc;
//     }, {});

//     const orderedFiles = selectedPages.map(({ fileName, pageNum }) => {
//       const uploadedFilePath = uploadedFiles[fileName];
//       if (!uploadedFilePath) {
//         throw new Error(`Uploaded file '${fileName}' not found.`);
//       }
//       return { path: uploadedFilePath, range: pageNum };
//     });

//     let mergedFileName = "merged";
//     req.files.forEach(
//       (file) =>
//         (mergedFileName += `_${file.originalname.replace(".pdf", "")}`)
//     );
//     mergedFileName += `_${Date.now()}.pdf`;
//     const outputFilePath = path.join(__dirname, "public", "merged_files", mergedFileName);

//     await mergePdfs(orderedFiles, outputFilePath);
//     const mergedFileUrl = `/merged_files/${mergedFileName}`;
//     res.status(200).json({ mergedFileUrl });
//     console.log({ mergedFileUrl });

//     setTimeout(() => {
//       rimraf(outputFilePath)
//         .then(() => {
//           console.log(`Merged PDF deleted successfully: ${outputFilePath}`);
//         })
//         .catch((err) => {
//           console.error(`Failed to delete merged PDF: ${outputFilePath}`, err);
//         });
//     }, 60 * 1000);
//   } catch (error) {
//     if (error.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).send('One or more files are too large. Please upload files smaller than 50 MB.');
//     }
//     console.error("Error merging PDFs:", error.message);
//     res.status(500).send(`An error occurred while merging PDFs: ${error.message}`);
//   }
// });

