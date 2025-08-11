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

export const scrapeAll = async (req, res) => {
  const { keywords, filter } = req.query;

  if (!keywords) {
    res.status(401).json({ message: "No keywords provided" });
  }

  let linkedinData = [];
  let kumariJobsData = [];
  let meroJobsData = [];

  try {
    if (filter && filter.length > 0) {
      const scrapePromises = [];

      if (filter.includes("linkedin")) {
        scrapePromises.push(
          scrapeLinkedinService(keywords).then((data) => {
            linkedinData = data;
          })
        );
      }

      if (filter.includes("kumarijobs")) {
        scrapePromises.push(
          scrapeKumariJobsService(keywords).then((data) => {
            kumariJobsData = data;
          })
        );
      }

      if (filter.includes("merojobs")) {
        scrapePromises.push(
          scrapeMeroJobsService(keywords).then((data) => {
            meroJobsData = data;
          })
        );
      }

      await Promise.all(scrapePromises);
    } else {
      const [linkedin, kumari, mero] = await Promise.all([
        scrapeLinkedinService(keywords),
        scrapeKumariJobsService(keywords),
        scrapeMeroJobsService(keywords),
      ]);

      linkedinData = linkedin;
      kumariJobsData = kumari;
      meroJobsData = mero;
    }

    const data = [...linkedinData, ...kumariJobsData, ...meroJobsData];

    res.json({ message: "Scrape Successful", data });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
