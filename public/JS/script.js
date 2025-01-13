// Get references to HTML elements
const pdfInput = document.getElementById("pdfs");
const previewContainer = document.getElementById("preview-container");
const selectedPagesInput = document.getElementById("selectedPages");
const mergeForm = document.getElementById("mergeForm");

let selectedPages = []; // Array to track selected pages

// Event listener for file input change
pdfInput.addEventListener("change", (event) => {
  const files = event.target.files;

  // Check if files are valid PDFs
  if (files.length > 0) {
    previewContainer.innerHTML = ""; // Clear the preview container
    selectedPages = []; // Reset the selected pages array
    renderMultiplePdfs(files); // Render the uploaded PDFs
  } else {
    alert("Please select valid PDF files.");
  }
});

// Function to render multiple PDFs
async function renderMultiplePdfs(files) {
  for (let file of files) {
    if (file.type === "application/pdf") {
      await renderPdf(file); // Render each PDF
    } else {
      console.log(`Skipping invalid file: ${file.name}`);
    }
  }
}

// Function to render a single PDF
async function renderPdf(file) {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  const totalPages = pdf.numPages;

  // Create a container for the PDF pages
  const pdfContainer = document.createElement("div");
  pdfContainer.classList.add("pdf-container");

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const canvas = document.createElement("canvas");
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });

    // Set canvas dimensions
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page on the canvas
    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;

    // Create a wrapper for the canvas and checkbox
    const pageWrapper = document.createElement("div");
    pageWrapper.classList.add("pdf-page");

    // Create a checkbox for selecting the page
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.pageNum = pageNum;
    checkbox.dataset.fileName = file.name;

    // Add change event listener to the checkbox
    checkbox.addEventListener("change", () => handlePageSelection(checkbox));

    // Add the canvas and checkbox to the wrapper
    pageWrapper.appendChild(canvas);
    pageWrapper.appendChild(checkbox);

    // Add the wrapper to the PDF container
    pdfContainer.appendChild(pageWrapper);
  }

  // Add the PDF container to the preview section
  previewContainer.appendChild(pdfContainer);
}

// Function to handle page selection
function handlePageSelection(checkbox) {
  const pageNum = checkbox.dataset.pageNum;
  const fileName = checkbox.dataset.fileName;

  if (checkbox.checked) {
    // Add the page to the selected pages array
    selectedPages.push({ pageNum, fileName });
  } else {
    // Remove the page from the selected pages array
    selectedPages = selectedPages.filter(
      (page) => page.pageNum !== pageNum || page.fileName !== fileName
    );
  }

  // Update the hidden input field with the selected pages
  selectedPagesInput.value = JSON.stringify(selectedPages);
}

// Add an event listener to the form submission
mergeForm.addEventListener("submit", (event) => {
  if (selectedPages.length === 0) {
    event.preventDefault(); // Prevent form submission
    alert("Please select at least one page to merge.");
  }
});
