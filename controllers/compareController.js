import {
  parsePdf,
  calculateSimilarity,
  getMatchedData,
} from "../services/compareService.js";

export const compareResumeAndJob = async (req, res) => {
  try {
    const resume = req.file;
    const { jobDescription } = req.body;

    if (!resume) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(jobDescription, "desc");

    const resumeData = await parsePdf(resume.buffer);

    const similarity = calculateSimilarity(jobDescription, resumeData);

    const matchedData = getMatchedData(jobDescription, resumeData);

    res.json({
      message: "PDF parsed successfully",
      parsedResume: resumeData,
      similarity,
      matchedData,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
