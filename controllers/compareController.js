export const compareResumeAndJob = (req, res) => {
  try {
    console.log("comparing");
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
