import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
// import { mergePdfs } from "./merge.js";
const port = process.env.PORT || 3000;
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

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port} or ${port}`);
});
// export default app;  // Vercel will use this export
