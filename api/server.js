const express = require('express');
const app = express();
const PDFLib = require('pdf-lib');
const fs = require('fs');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/merge', async (req, res) => {
  try {
    const files = req.files; // Assuming you're sending the files via a form-data POST request
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of files) {
      const pdfDoc = await PDFLib.PDFDocument.load(file.data);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.send(mergedPdfBytes);
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).send('Error merging PDFs');
  }
});

app.listen(3000, () => {
  console.log('Backend is running on port 3000');
});
