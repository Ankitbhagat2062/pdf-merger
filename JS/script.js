pdffilename = document.getElementsByClassName('pdf-pages')
const pdfInput = document.getElementById("pdfs");
const previewContainer = document.getElementById("preview-container");
let uploadedFiles = [];
// Initialize an array to track selected pages in the order they were selected
let selectedPages = [];

// Event listener for file input
document.getElementById('pdfs').addEventListener('change', (event) => {
  const files = event.target.files;
  if (files && files[0].type === 'application/pdf') {
    renderMultiplePdfs(files); // Call to render multiple PDFs
  } else {
    alert('Please select valid PDF files.');
  }

});

// Function to handle multiple PDF files
async function renderMultiplePdfs(files) {
  const container = document.getElementById('preview-container');
  container.innerHTML = ''; // Clear previous content

  // Iterate through each selected file
  for (let file of files) {
    if (file.type === 'application/pdf') {
      await renderPdf(file); // Render each PDF
    } else {
      console.log('Please select valid PDF files only.');
    }
  }
}
// function handleSelectAll(pagesContainer) {
//   const checkboxes = pagesContainer.querySelectorAll('input[type="checkbox"]');
//   checkboxes.forEach(checkbox => {
//     checkbox.checked = true;
//     const pageNum = checkbox.dataset.pageNum;
//     const fileName = checkbox.dataset.fileName;
//     selectedPages.push({ pageNum, fileName });
//   });
//   console.log('Selected Pages:', selectedPages); // Update console with selected pages
// }
//   const selectAllButton = document.getElementById(`selectAll-${file.name}`);
//   const myCheckbox = document.getElementById(`${file.name}`); 
// selectAllButton.addEventListener('click', () => {
//   handleSelectAll(pages); // Pass the current pages container (the first occurrence)
// });

async function renderPdf(file) {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise; // Load the PDF
  const totalPages = pdf.numPages; // Get the total number of pages
  const container = document.getElementById('preview-container'); // Container for displaying pages

  // Add the file name as a label above the pages

  const pages = document.createElement('div')
  pages.classList.add('pdf-pages');
  container.appendChild(pages);


  const fileNameLabel = document.createElement('div');
  fileNameLabel.classList.add('pdf-file-name');
  fileNameLabel.textContent = `File: ${file.name}`;
  pages.appendChild(fileNameLabel);
  // Create "Select All" checkbox and label
  const selectall = document.createElement('div')
  selectall.classList.add('selectall');
  selectall.classList.add('d-flex');
  selectall.classList.add('gap-2');
  selectall.classList.add('justify-content-center');
  selectall.classList.add('align-items-center');
  pages.insertBefore(selectall, pages.firstChild);
  // pages.insertAdjacentHTML('afterbegin', `
  //   <label id="selectAll-${file.name}" class="btn btn-primary btn-lg mt-4" for="SelectAll-${file.name}">Select All Pages of ${file.name}</label>
  //   <input style="display: none;" type="checkbox" id="${file.name}" class="form-control-file" name="SelectAll-${file.name}">
  //   `);
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const canvas = document.createElement('canvas');
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });

    canvas.height = (viewport.height);
    canvas.width = viewport.width;
    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    canvas.style.maxWidth = '99.5%';
    canvas.style.maxHeight = '80.5%';
    canvas.style.margin = '0 auto';
    canvas.style.flexShrink = '0 ';
    console.log(canvas.height, canvas.width)

    const pageWrapper = document.createElement('div');
    pages.appendChild(pageWrapper); // Add the page wrapper to the container
    pageWrapper.classList.add('pdf-page');
    const selectall = document.createElement('div')
    selectall.classList.add('selectall');
    selectall.classList.add('d-flex');
    selectall.classList.add('gap-2');
    selectall.classList.add('justify-content-center');
    selectall.classList.add('align-items-center');
    pageWrapper.appendChild(canvas); // Add canvas to the wrapper
    pageWrapper.appendChild(selectall);
    // ... (rest of the code for creating checkbox, rendering canvas, etc.) ...
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.pageNum = pageNum;
    checkbox.dataset.fileName = file.name;
    checkbox.addEventListener('change', () => handlePageSelection(checkbox)); // Handle page selection
    const label = document.createElement('label');
    label.htmlFor = `${file.name}-${pageNum}`; // Use unique IDs for labels
    label.textContent = `Page ${pageNum}`;
    selectall.appendChild(label);
    checkbox.id = `${file.name}-${pageNum}`;
    checkbox.classList.add(`${file.name}`);
    selectall.appendChild(checkbox);

    await handleTextOverflow(selectall, fileNameLabel);
  }

  const selectAllCheckbox = document.createElement('input');
  selectAllCheckbox.type = "checkbox";
  selectAllCheckbox.id = `${file.name}-selectAll`;

  const selectAllLabel = document.createElement('label');
  selectAllLabel.htmlFor = `${file.name}-selectAll`;
  selectAllLabel.textContent = "Select All Pages of " + file.name;

  selectall.insertBefore(selectAllCheckbox, selectall.firstChild);
  selectall.insertBefore(selectAllLabel, selectall.firstChild);

  selectAllCheckbox.addEventListener('change', () => {
    const allCheckboxes = pages.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked;

      if (selectAllCheckbox.checked) {
        selectedPages.push({ pageNum: checkbox.dataset.pageNum, fileName: file.name });
      } else {
        selectedPages = selectedPages.filter(page => page.pageNum !== checkbox.dataset.pageNum && page.fileName !== file.name);
      }
    });
  });
 
}
async function handleTextOverflow(selectAll, pdfFileName) {
  if (!pdfFileName || !pdfFileName.parentElement) {
    console.error("pdfFileName or its parentElement is null");
    return; // Or handle the error in another way
  }
  const parentElement = pdfFileName.parentElement;

  // Store initial parent element styles
  const initialParentStyles = {
    display: window.getComputedStyle(parentElement)['display'],
  };

  // Temporarily apply styles to allow text wrapping
  await setElementStyles(parentElement, {
    'white-space': 'normal',
    'max-width': '100%',
    'overflow-wrap': 'break-word',
    'word-break': 'break-all',
  });

  // Recalculate scrollHeight after applying wrapping styles
  const newPdfFileNameScrollHeight = pdfFileName.scrollHeight;

  // Restore original parent element styles
  await setElementStyles(parentElement, initialParentStyles);

  // Set min-height only if necessary
  if (selectAll.scrollHeight > selectAll.clientHeight) {
    await setElementStyles(selectAll, {
      'min-height': `${selectAll.scrollHeight}px`,
    });
  }

  if (pdfFileName.scrollHeight > pdfFileName.clientHeight) {
    await setElementStyles(pdfFileName, {
      'min-height': `${newPdfFileNameScrollHeight}px`, 
    }); 
  }
}

// Define setElementStyles function outside of renderPdf
async function setElementStyles(el, styles) {
  for (const [key, value] of Object.entries(styles)) {
    el.style[key] = value;
  }
}
// Function to handle page selection (order matters)
function handlePageSelection(checkbox) {
  const pageNum = checkbox.dataset.pageNum;
  const fileName = checkbox.dataset.fileName;
  console.log(pageNum, fileName)
  if (checkbox.checked) {
    // If page is selected, push it to the selectedPages array
    selectedPages.push({ pageNum, fileName });
    console.log(selectedPages)
  } else {
    // If page is deselected, remove it from the array
    selectedPages = selectedPages.filter(page => page.pageNum !== pageNum || page.fileName !== fileName);
  }
}

// Merge selected pages into a single PDF using pdf-lib
async function mergeSelectedPages() {
  if (selectedPages.length === 0) {
    console.log("Please select at least one page to merge.");
    return;
  }
  const formData = new FormData();
  console.log("Selected Pages Data:", JSON.stringify(selectedPages)); // Log this to verify
  formData.append('selectedPages', JSON.stringify(selectedPages));

  const files = document.getElementById('pdfs').files;
  Array.from(files).forEach(file => {
    formData.append('pdfs', file);
    console.log("pdfs",file)
  });
  // Send the selected pages and files to the backend
  try {
    console.log("FormData before sending:", formData);
    const response = await fetch('/merge', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.log(errorText); // Show error message to the user
    } 
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error merging PDFs:", errorText);
      return;
    }
    // if (response.ok) {
      const result = await response.json();
      const mergedFileUrl = result.mergedFileUrl;
      
      // Redirect the user to view the merged file
      window.location.href = mergedFileUrl;
      //  // Redirect to or download the merged PDF
      const link = document.createElement("a");
      link.href = mergedFileUrl;
      link.download = mergedFileUrl.split("/").pop(); // Use the file name from the URL
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up
      
    // } else {
    //   console.log("Error merging PDFs.");
    // }
  } catch (error) {
    console.error("Error:", error);
    console.log("An error occurred while merging PDFs.");
  }
}
// Attach the mergeSelectedPages function to the submit button
document.querySelector('button[type="submit"]').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent form submission
  mergeSelectedPages(); // Handle page merge selection
});
