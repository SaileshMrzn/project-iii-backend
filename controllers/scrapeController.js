import {
  scrapeLinkedinService,
  scrapeKumariJobsService,
  scrapeMeroJobsService,
} from "../services/scrapeService.js";

export const scrapeLinkedin = async (req, res) => {
  const { keywords } = req.query;

  if (!keywords) {
    res.status(401).json({ message: "No keywords provided" });
  }

  try {
    const scrapedData = await scrapeLinkedinService(keywords);

    res.json({ message: "Scrape Successful", data: scrapedData });
  } catch (error) {
    console.error("Error", error);
    res.status(500).json(error.message);
  }
};

export const scrapeKumariJobs = async (req, res) => {
  const { keywords } = req.query;

  if (!keywords) {
    res.status(401).json({ message: "No keywords provided" });
  }

  try {
    const scrapedData = await scrapeKumariJobsService(keywords);

    res.json({ message: "Scrape Successful", data: scrapedData });
  } catch (error) {
    console.error("Error", error);
    res.status(500).json(error.message);
  }
};

export const scrapeMeroJobs = async (req, res) => {
  const { keywords } = req.query;

  if (!keywords) {
    res.status(401).json({ message: "No keywords provided" });
  }

  try {
    const scrapedData = await scrapeMeroJobsService(keywords);

    res.json({ message: "Scrape Successful", data: scrapedData });
  } catch (error) {
    console.error("Error", error);
    res.status(500).json(error.message);
  }
};
