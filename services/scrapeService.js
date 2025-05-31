import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

const openBrowser = async (url) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const content = await page.content();

  return content;
};

export const scrapeLinkedinService = async (keywords) => {
  const url = `https://www.linkedin.com/jobs/search?keywords=${keywords}&location=Kathmandu&position=1&pageNum=0`;

  const content = await openBrowser(url);

  const $ = cheerio.load(content);

  const linkedinJobs = [];

  $(".base-search-card__info").each((index, element) => {
    const parent = $(element).parent();

    const jobLink = parent.find("a").attr("href");

    const jobTitle = $(element).find(".base-search-card__title").text().trim();
    const companyName = $(element)
      .find(".base-search-card__subtitle a")
      .text()
      .trim();
    const timeAgo =
      $(element).find(".job-search-card__listdate").text().trim() ||
      $(element).find(".job-search-card__listdate--new").text().trim();

    linkedinJobs.push({
      jobNo: index + 1,
      title: jobTitle,
      company: companyName,
      posted: timeAgo,
      link: jobLink,
      source: "LinkedIn",
    });
  });

  return linkedinJobs;
};

export const scrapeKumariJobsService = async (keywords) => {
  const url = `https://www.kumarijob.com/search?keywords=${keywords}`;

  const content = await openBrowser(url);

  const $ = cheerio.load(content);

  const kumariJobs = [];

  $(".job-card-desktop").each((index, element) => {
    const jobTitle = $(element)
      .find(".cardone__body--content .title a")
      .text()
      .trim();

    const companyName = $(element)
      .find(".cardone__body--content .meta a")
      .text()
      .trim();

    const deadline = $(element)
      .find(".description__two--foot strong")
      .text()
      .trim();

    const jobLink = $(element).find(".description__two--foot a").attr("href");

    kumariJobs.push({
      jobNo: index + 1,
      title: jobTitle,
      company: companyName,
      posted: deadline,
      link: jobLink,
      source: "Kumari Jobs",
    });
  });

  return kumariJobs;
};
