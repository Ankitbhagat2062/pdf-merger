import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the 'public' folder
app.use("/CSS", express.static(path.join(__dirname, "public", "CSS")));
app.use("/JS", express.static(path.join(__dirname, "public", "JS")));
app.use(express.static(path.join(__dirname, "public")));

// Route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


export default app;  // Vercel will use this export
