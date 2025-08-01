# PDF Merger

## About This App

PDF Merger is a Node.js application that allows users to upload multiple PDF files, select specific pages from each, and merge them into a single PDF document. The app provides a user-friendly interface to preview PDF pages, select pages to merge, and download the merged PDF. It is built using Express.js for the backend and leverages several PDF manipulation libraries to handle merging and rendering.

##    <a href="https://pdf-merger-ezovcdry4-ankitbhagat2062s-projects.vercel.app/"><strong>➥ Live Demo</strong></a>

## How I Made It

The app consists of a backend server and a frontend client:

- **Backend (server.js):**  
  The backend is built with Express.js. It handles file uploads, page selection data, and merges the selected PDF pages using the `pdf-merger-js` library. Initially, the app used `multer` for file uploads, but it can be replaced with other libraries like `formidable` for better performance. The server exposes a `/merge` POST endpoint that accepts uploaded PDF files and selected page information, merges the PDFs accordingly, and returns the merged PDF as a downloadable file.

- **PDF Merging (merge.js):**  
  The merging logic is encapsulated in `merge.js`, which uses the `pdf-merger-js` library. It supports merging entire PDF files or specific page ranges based on user selection.

- **Frontend (public/JS/script.js):**  
  The frontend uses JavaScript and the `pdfjs-dist` library to render PDF pages in the browser. Users can preview each page of the uploaded PDFs, select individual pages or all pages, and submit their selection. The selected pages and files are sent to the backend for merging.

- **Other Libraries and Packages:**  
  - `express`: Web framework for Node.js.  
  - `pdf-merger-js`: Library to merge PDF files.  
  - `pdfjs-dist`: PDF rendering library used on the client side.  
  - `rimraf`: For cleaning up files/directories if needed.  
  - `nodemon`: Development dependency for auto-restarting the server during development.

## How to Clone and Run

1. Clone the repository:

   ```bash
   git clone https://github.com/Ankitbhagat2062/pdf-merger.git
   cd pdf-merger
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   - For production:

     ```bash
     npm start
     ```

   - For development (with auto-restart):

     ```bash
     npm run dev
     ```

4. Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

5. Upload PDF files, select pages, and merge them using the web interface.

## Project Structure and Key Files

- `server.js`: Main backend server file handling routes, file uploads, and PDF merging requests.
- `merge.js`: Contains the PDF merging logic using `pdf-merger-js`.
- `public/JS/script.js`: Frontend JavaScript for rendering PDFs, handling page selection, and submitting merge requests.
- `package.json`: Lists all dependencies and scripts used in the project.

## Additional Notes

- The app currently supports uploading up to 12 PDF files with a maximum size of 50 MB each.
- The merged PDF is returned as a downloadable file.
- The frontend uses `pdfjs-dist` to render PDF pages for preview and selection.
- The backend uses `pdf-merger-js` to merge PDFs efficiently.

Feel free to explore the codebase for more details or contribute to the project!

---
Author: Ankit Bhagat  
Repository: [https://github.com/Ankitbhagat2062/pdf-merger](https://github.com/Ankitbhagat2062/pdf-merger)
