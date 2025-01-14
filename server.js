const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Route to serve the index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Example POST endpoint (if used)
app.post("/api/merge", (req, res) => {
  res.status(200).send("This is a test POST endpoint!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
