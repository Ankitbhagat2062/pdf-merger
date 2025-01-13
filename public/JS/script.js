
const pdfInput = document.getElementById("pdfs");
const previewContainer = document.getElementById("preview-container");

// Handle PDF selection
pdfInput.addEventListener("change", (event) => {
  const files = event.target.files;
  previewContainer.innerHTML = ""; // Clear previous previews
  if (files.length === 0) {
    alert("No files selected.");
    return;
  }

  // Display file names or other information for user feedback
  Array.from(files).forEach((file) => {
    const p = document.createElement("p");
    p.textContent = `Selected file: ${file.name}`;
    previewContainer.appendChild(p);
  });
});
