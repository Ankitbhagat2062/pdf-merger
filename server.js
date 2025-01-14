const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;  // Vercel sets the port dynamically

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post("/merge", upload.array("pdfs", 12), async (req, res) => {
  
})
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
