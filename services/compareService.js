import pdfParse from "pdf-parse";

export const analyzeMatch = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer, { max: 2 });

    const pages = data.text.split("\f");
    console.log(typeof pages);

    const cleanedText = data.text
      .replace(/[ \t]+/g, " ")
      .replace(/\r?\n/g, "")
      .trim();

    // console.log(pages, "pp");
    // console.log(cleanedText, "parsed");
    return cleanedText;
  } catch (error) {
    throw new Error("Failed to extract text from PDF");
  }
};
