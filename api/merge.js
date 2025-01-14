const multer = require("multer");
const path = require("path");
const { mergePdfs } = require("../merge"); // Import your merge logic
const { rimraf } = require("rimraf");

const upload = multer({ dest: "/tmp/uploads/" });

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const formData = await new Promise((resolve, reject) => {
      upload.array("pdfs")(req, {}, (err) => {
        if (err) return reject(err);
        resolve(req);
      });
    });

    try {
      const files = formData.files || [];
      if (files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      // Simulate merging PDFs
      const outputFilePath = path.join("/tmp", "merged.pdf");
      await mergePdfs(files.map((file) => file.path), outputFilePath);

      res.status(200).json({
        message: "Merge successful",
        fileUrl: `/tmp/merged.pdf`, // You'll need to provide a way to download this file
      });

      // Cleanup after some time
      setTimeout(() => {
        rimraf(outputFilePath).catch(console.error);
      }, 60 * 1000); // 1 minute
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to merge PDFs", details: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
