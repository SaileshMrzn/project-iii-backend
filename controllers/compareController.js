import { analyzeMatch } from "../services/compareService.js";

export const compareResumeAndJob = async (req, res) => {
  try {
    const resume = req.file;

    if (!resume) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const resumeData = await analyzeMatch(resume.buffer);

    console.log(resumeData, "resumeData");

    res.json({ message: "PDF parsed successfully", data: resumeData });
    console.log("comparing");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
