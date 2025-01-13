const pdfInput = document.getElementById("pdfs");
let selectedPages = [];

// Event listener for file input
pdfInput.addEventListener("change", (event) => {
  const files = event.target.files;
  if (files && files[0].type === "application/pdf") {
    renderMultiplePdfs(files);
  } else {
    alert("Please select valid PDF files.");
  }
});

// Function to handle multiple PDF files
async function renderMultiplePdfs(files) {
  const container = document.getElementById("preview-container");
  container.innerHTML = ""; // Clear previous content

  for (let file of files) {
    if (file.type === "application/pdf") {
      await renderPdf(file);
    } else {
      console.log("Please select valid PDF files only.");
    }
  }
}

async function renderPdf(file) {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  const totalPages = pdf.numPages;
  const container = document.getElementById("preview-container");

  const pages = document.createElement("div");
  pages.classList.add("pdf-pages");
  container.appendChild(pages);

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const canvas = document.createElement("canvas");
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const pageWrapper = document.createElement("div");
    pageWrapper.classList.add("pdf-page");
    pages.appendChild(pageWrapper);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.pageNum = pageNum;
    checkbox.dataset.fileName = file.name;
    checkbox.addEventListener("change", () => handlePageSelection(checkbox));

    const label = document.createElement("label");
    label.textContent = `Page ${pageNum}`;
    pageWrapper.appendChild(canvas);
    pageWrapper.appendChild(label);
    pageWrapper.appendChild(checkbox);
  }
}

// Function to handle page selection
function handlePageSelection(checkbox) {
  const pageNum = checkbox.dataset.pageNum;
  const fileName = checkbox.dataset.fileName;

  if (checkbox.checked) {
    selectedPages.push({ pageNum, fileName });
  } else {
    selectedPages = selectedPages.filter(
      (page) => page.pageNum !== pageNum || page.fileName !== fileName
    );
  }
}

// Attach the mergeSelectedPages function to the form submission
document.querySelector("form").addEventListener("submit", (event) => {
  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = "selectedPages";
  hiddenInput.value = JSON.stringify(selectedPages);

  event.target.appendChild(hiddenInput); // Add the selected pages to the form data
});
