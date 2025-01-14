const multer = require('multer');
const path = require('path');
const { mergePdfs } = require('../merge'); // Ensure merge logic is in '../merge.js'
const rimraf = require('rimraf');

// Multer setup for handling file uploads
const upload = multer({ dest: '/tmp/' }); // Temporary storage on serverless environments

// Helper to parse multipart form data in serverless functions
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    upload.array('pdfs', 5)(req, {}, (err) => {
      if (err) return reject(err);
      resolve(req);
    });
  });
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    await parseForm(req);

    // Access uploaded files
    const uploadedFiles = req.files.map((file) => file.path);
    const outputFilePath = `/tmp/merged_${Date.now()}.pdf`;

    // Merge the PDFs
    await mergePdfs(uploadedFiles, outputFilePath);

    // Return the merged file URL
    res.setHeader('Content-Type', 'application/json');
    res.json({ fileUrl: outputFilePath });

    // Clean up merged files after 1 minute
    setTimeout(() => {
      rimraf(outputFilePath, (err) => {
        if (err) console.error('Error cleaning up merged file:', err);
      });
    }, 60 * 1000);
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).send('An error occurred while merging PDFs.');
  }
};
