const pdfInput = document.getElementById("pdfs");
const previewContainer = document.getElementById("preview-container");

pdfInput.addEventListener("change", async (event) => {
  const files = event.target.files;
  if (files.length === 0) {
    alert("No files selected.");
    return;
  }

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("pdfs", file);
  });

  try {
    // Fetch rendered pages from the backend
    const response = await fetch("/api/merge", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to render PDFs");
    }

    const { renderedPages } = await response.json();

    // Display rendered pages in the preview container
    previewContainer.innerHTML = "";
    renderedPages.forEach((imageSrc) => {
      const img = document.createElement("img");
      img.src = imageSrc;
      previewContainer.appendChild(img);
    });
  } catch (error) {
    console.error("Error uploading files:", error.message);
    alert("An error occurred while uploading files.");
  }
});
