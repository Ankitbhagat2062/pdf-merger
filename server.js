import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { mergePdfs } from "./merge.js";
import { rimraf } from 'rimraf'; // Import rimraf using named export
import fs from "fs/promises"; // Use promises for file system operations
const app = express();
const upload = multer({ dest: "uploads/", limits: { fileSize: 50 * 1024 * 1024 }, });
const port = process.env.PORT || 3000;

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory
app.use("/CSS", express.static(path.join(__dirname, "CSS")));
app.use("/JS", express.static(path.join(__dirname, "JS")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates/index.html"));
});
app.post("/merge", upload.array("pdfs", 12), async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

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

    // Merge PDFs and get the resulting buffer
    const mergedPdfBuffer = await mergePdfs(orderedFiles);

    // Optionally, upload the merged PDF to an external storage like AWS S3, or return as a download link
    const base64Data = mergedPdfBuffer.toString("base64");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
    res.send(Buffer.from(base64Data, "base64"));
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send("One or more files are too large. Please upload files smaller than 50 MB.");
    }
    console.error("Error merging PDFs:", error.message);
    res.status(500).send(`An error occurred while merging PDFs: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port} or ${port}`);
});
