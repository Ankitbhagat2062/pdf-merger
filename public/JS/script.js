
const pdfInput = document.getElementById("pdfs");
const mergeButton = document.getElementById("upload-trigger");
let selectedPages = [];

pdfInput.addEventListener("change", handleFiles);

async function handleFiles(event) {
  const files = event.target.files;
  if (files.length === 0) {
    alert("Please select PDF files.");
    return;
  }

  selectedPages = []; // Clear previous selection
  const previewContainer = document.getElementById("preview-container");
  previewContainer.innerHTML = ""; // Clear previous previews

  for (const file of files) {
    const pdfDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    const totalPages = pdfDoc.getPageCount();

    const fileDiv = document.createElement("div");
    fileDiv.innerHTML = `<h3>${file.name} (Pages: ${totalPages})</h3>`;
    previewContainer.appendChild(fileDiv);

    for (let i = 0; i < totalPages; i++) {
      const pageCheckbox = document.createElement("input");
      pageCheckbox.type = "checkbox";
      pageCheckbox.dataset.file = file.name;
      pageCheckbox.dataset.page = i;
      pageCheckbox.addEventListener("change", () => {
        if (pageCheckbox.checked) {
          selectedPages.push({ file, pageIndex: i });
        } else {
          selectedPages = selectedPages.filter(
            (p) => p.file !== file || p.pageIndex !== i
          );
        }
      });

      const pageLabel = document.createElement("label");
      pageLabel.textContent = `Page ${i + 1}`;

      const pageDiv = document.createElement("div");
      pageDiv.appendChild(pageCheckbox);
      pageDiv.appendChild(pageLabel);

      fileDiv.appendChild(pageDiv);
    }
  }
}

mergeButton.addEventListener("click", async () => {
  if (selectedPages.length === 0) {
    alert("Please select at least one page to merge.");
    return;
  }

  const mergedPdf = await PDFLib.PDFDocument.create();

  for (const { file, pageIndex } of selectedPages) {
    const pdfDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    const [page] = await mergedPdf.copyPages(pdfDoc, [pageIndex]);
    mergedPdf.addPage(page);
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "merged.pdf";
  downloadLink.textContent = "Download Merged PDF";

  document.body.appendChild(downloadLink);
});