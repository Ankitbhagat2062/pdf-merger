const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;  // Vercel sets the port dynamically
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/merge', upload.array('pdfs', 12), function (req, res, next) {
  const selectedPages = JSON.parse(req.body.selectedPages || "[]");
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
  mergedFileName = `_${Date.now()}.pdf`;
  const outputFilePath = path.join(__dirname, "public", "merged_files", mergedFileName);
    //   // Merge the selected pages from ordered files
    await mergePdfs(orderedFiles, outputFilePath);
     res.redirect(`/merged_files/${mergedFileName}`);
})

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
