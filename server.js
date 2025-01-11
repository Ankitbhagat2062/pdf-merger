import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { mergePdfs } from "./merge.js";

const app = express();
const upload = multer({ dest: "uploads/",limits: { fileSize: 50 * 1024 * 1024 }, });
const port =  process.env.PORT || 3000;

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
    // Log request data for debugging
    console.log("Request Body:", req.body);  // Check if 'selectedPages' is in the body
    console.log("Uploaded Files:",req.files); // Check the uploaded files

    // Ensure selectedPages exists and is parsed correctly
    const selectedPages = JSON.parse(req.body.selectedPages || "[]");
    if (!selectedPages.length) {
      return res.status(400).send("No pages selected for merging.");
    }

    // Map file names (from the frontend) to actual uploaded file paths
    const uploadedFiles = req.files.reduce((acc, file) => {
      acc[file.originalname] = file.path; // Map original file name to its temp path
      return acc;
    }, {});

    // Prepare ordered files with selected page ranges
    const orderedFiles = selectedPages.map(({ fileName, pageNum }) => {
      const uploadedFilePath = uploadedFiles[fileName];
      if (!uploadedFilePath) {
        throw new Error(`Uploaded file '${fileName}' not found.`);
      }
      return { path: uploadedFilePath, range: pageNum }; // Assuming you want to merge specific page ranges
    });
    let a = "";
    for (let i = 0; i < req.files.length; i++) {
      const element = req.files[i].originalname.replace(".pdf", "")
      a = a + "_" + element
    }
    console.log(a)
    const mergedFileName = `merged${a}_${Date.now()}.pdf`;
    const outputFilePath = path.join(__dirname, "public", "merged_files", mergedFileName);

    // Merge the selected pages from ordered files
    await mergePdfs(orderedFiles, outputFilePath);

    // Return response with URL to the merged file
    res.json({ mergedPdfUrl: `/merged_files/${mergedFileName}` });

  } catch (error) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('One or more files are too large. Please upload files smaller than 50 MB.');
    }
    console.error("Error merging PDFs:", error.message);
    res.status(500).send(`An error occurred while merging PDFs: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port} or ${port}`);
});