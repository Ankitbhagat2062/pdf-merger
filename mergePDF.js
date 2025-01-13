import PDFMerger from "pdf-merger-js";

const mergePdfs = async (orderedFiles, outputPath) => {
  const merger = new PDFMerger();

  for (const file of orderedFiles) {
    if (file.range === "all") {
      await merger.add(file.path); // Add the entire file
    } else {
      await merger.add(file.path, file.range); // Add specific pages
    }
  }

  await merger.save(outputPath); // Save the merged PDF to the specified path
};

export { mergePdfs };
