import multer from 'multer';
import path from 'path';
import { mergePdfs } from '../merge.js'; // Assuming you have a merge.js for the PDF logic
import { rimraf } from 'rimraf';
// import fs from 'fs/promises';

const upload = multer({ dest: 'uploads/', limits: { fileSize: 50 * 1024 * 1024 } });

// Export the handler for the POST request
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Log request data for debugging
      console.log('Request Body:', req.body); // Check if 'selectedPages' is in the body
      console.log('Uploaded Files:', req.files); // Check the uploaded files

      // Ensure selectedPages exists and is parsed correctly
      const selectedPages = JSON.parse(req.body.selectedPages || '[]');
      if (!selectedPages.length) {
        return res.status(400).send('No pages selected for merging.');
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

      let mergedFileName = 'merged';
      req.files.forEach(
        (file) =>
          (mergedFileName += `_${file.originalname.replace('.pdf', '')}`)
      );
      mergedFileName += `_${Date.now()}.pdf`;
      const outputFilePath = path.join(__dirname, '..', 'public', 'merged_files', mergedFileName);

      // Merge the selected pages from ordered files
      await mergePdfs(orderedFiles, outputFilePath);
      const mergedFileUrl = `/merged_files/${mergedFileName}`;
      res.status(200).json({ mergedFileUrl });

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
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send('One or more files are too large. Please upload files smaller than 50 MB.');
      }
      console.error('Error merging PDFs:', error.message);
      res.status(500).send(`An error occurred while merging PDFs: ${error.message}`);
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
