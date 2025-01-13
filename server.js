import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the 'public' folder
app.use("/CSS", express.static(path.join(__dirname, "public", "CSS")));
app.use("/JS", express.static(path.join(__dirname, "public", "JS")));
app.use(express.static(path.join(__dirname, "public")));

// Route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.post("/merge", upload.array("pdfs", 12), async (req, res) => {
  try {
    // Log request data for debugging
    console.log("Request Body:", req.body);  // Check if 'selectedPages' is in the body
    console.log("Uploaded Files:", req.files); // Check the uploaded files

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
    let mergedFileName = "merged";
      req.files.forEach(
        (file) =>
          (mergedFileName += `_${file.originalname.replace(".pdf", "")}`)
      );
      mergedFileName += `_${Date.now()}.pdf`;
    const outputFilePath = path.join(__dirname, "public", "merged_files", mergedFileName);
    //   // Merge the selected pages from ordered files
    await mergePdfs(orderedFiles, outputFilePath);
    const mergedFileUrl = `/merged_files/${mergedFileName}`;
    res.status(200).json({mergedFileUrl})
    console.log({mergedFileUrl})
    //  // Redirect the user to the merged file for download/viewing
    res.redirect(`/merged_files/${mergedFileName}`);

    setTimeout(() => {
      rimraf(outputFilePath)
        .then(() => {
          console.log(`Merged PDF deleted successfully: ${outputFilePath}`);
        })
        .catch((err) => {
          console.error(`Failed to delete merged PDF: ${outputFilePath}`, err);
        });
    }, 20 * 1000); // 1 minute delay
  } catch (error) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('One or more files are too large. Please upload files smaller than 50 MB.');
    }
    console.error("Error merging PDFs:", error.message);
    res.status(500).send(`An error occurred while merging PDFs: ${error.message}`);
  }
});


export default app;  // Vercel will use this export
