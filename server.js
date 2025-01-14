const express = require('express');
const path = require('path');
const multer = require('multer');
const { mergePdfs } = require('./merge'); // Assuming merge logic is in merge.js
const rimraf = require('rimraf');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files (like styles.css and JavaScript files)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// POST endpoint to handle PDF merging
app.post('/api/merge', upload.array('pdfs', 5), async (req, res) => {
  try {
    const uploadedFiles = req.files.map((file) => file.path);
    const outputFilePath = path.join(__dirname, 'public', 'merged', `merged_${Date.now()}.pdf`);

    // Perform the merge
    await mergePdfs(uploadedFiles, outputFilePath);

    // Send the merged file's URL back to the client
    const mergedFileUrl = `/merged/${path.basename(outputFilePath)}`;
    res.json({ fileUrl: mergedFileUrl });

    // Cleanup merged file after 1 minute
    setTimeout(() => {
      rimraf(outputFilePath, (err) => {
        if (err) console.error('Error cleaning up merged file:', err);
      });
    }, 60 * 1000);
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).send('An error occurred while merging PDFs.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
