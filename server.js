const express = require("express");
const multer = require("multer");
const fs = require("fs");
const PDFMerger = require("pdf-merger-js");

const app = express();
const upload = multer({ dest: "uploads/" }); // Temporary storage for uploads

app.post("/api/merge", upload.array("pdfs"), async (req, res) => {
  try {
    const merger = new PDFMerger();

    // Add uploaded PDFs to the merger
    for (const file of req.files) {
      await merger.add(file.path);
    }

    // Save merged PDF
    const outputPath = `merged_files/merged-${Date.now()}.pdf`;
    await merger.save(outputPath);

    // Send the file URL as the response
    res.status(200).json({ mergedFileUrl: `/merged_files/${outputPath.split('/').pop()}` });

    // Cleanup temporary files
    req.files.forEach(file => fs.unlinkSync(file.path));
  } catch (error) {
    console.error("Error merging PDFs:", error);
    res.status(500).json({ error: "Failed to merge PDFs" });
  }
});

app.use("/merged_files", express.static("merged_files")); // Serve merged files

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
