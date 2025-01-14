const express = require("express");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { pipeline } = require("stream");
const Busboy = require("busboy");
const { mergePdfs } = require("./merge"); // Your PDF merging logic

const app = express();
const port = process.env.PORT || 3000; // Vercel sets the port dynamically
const pipelineAsync = promisify(pipeline);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Route to serve the index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle PDF merging with file uploads
app.post("/merge", (req, res) => {
  const uploadedFiles = [];
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", (fieldname, file, filename) => {
    const savePath = path.join("/tmp", filename); // Use the /tmp directory for temporary storage
    const writeStream = fs.createWriteStream(savePath);
    uploadedFiles.push(savePath);

    pipelineAsync(file, writeStream).catch((err) => {
      console.error("Error uploading file:", err);
      res.status(500).send("Error uploading file");
    });
  });

  busboy.on("finish", async () => {
    try {
      if (uploadedFiles.length === 0) {
        return res.status(400).send("No files uploaded");
      }

      const mergedFileName = `merged_${Date.now()}.pdf`;
      const outputFilePath = path.join("/tmp", mergedFileName);

      // Merge the PDFs
      await mergePdfs(uploadedFiles, outputFilePath);

      // Respond with the merged file
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${mergedFileName}"`);
      fs.createReadStream(outputFilePath).pipe(res);

      // Cleanup temporary files after 1 minute
      setTimeout(() => {
        uploadedFiles.forEach((file) => fs.unlink(file, () => {}));
        fs.unlink(outputFilePath, () => {});
      }, 60 * 1000);
    } catch (err) {
      console.error("Error merging PDFs:", err);
      res.status(500).send("Error merging PDFs");
    }
  });

  req.pipe(busboy);
});

// Start the server
app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
