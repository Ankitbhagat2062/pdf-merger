import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
// import { mergePdfs } from "./merge.js";
const port = process.env.PORT || 3000;
// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the 'public' folder
app.use("/CSS", express.static(path.join(__dirname, "public", "CSS")));
app.use("/JS", express.static(path.join(__dirname, "public", "JS")));
app.use(express.static(path.join(__dirname, "public")));
const upload = multer({ dest: "uploads/", limits: { fileSize: 50 * 1024 * 1024 }, });
app.post("/merge", upload.array("pdfs", 12), async (req, res) => {
  try {
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
    res.redirect(`/merged_files/${mergedFileName}`);

  } 
  catch (error) {
      console.error("Error merging PDFs:", error.message);
      res.status(500).send(`An error occurred while merging PDFs: ${error.message}`);
  }
})
  
  // Route to serve index.html
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
  
  // export default app;  // Vercel will use this export
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port} or ${port}`);
  });
  