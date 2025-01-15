import { PDFDocument } from "pdf-lib";

/**
 * Merges selected pages from multiple PDF files.
 * @param {Array} orderedFiles - Array of objects with file path and range properties.
 * @returns {Buffer} - Buffer of the merged PDF.
 */
export async function mergePdfs(orderedFiles) {
  const mergedPdf = await PDFDocument.create();

  for (const { path, range } of orderedFiles) {
    // Read file as a buffer
    const pdfBytes = await fs.readFile(path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Add specified pages to the merged PDF
    for (const pageNum of range) {
      const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [pageNum - 1]); // Pages are zero-indexed
      mergedPdf.addPage(copiedPage);
    }
  }

  // Serialize the merged PDF to a buffer
  return await mergedPdf.save();
}
