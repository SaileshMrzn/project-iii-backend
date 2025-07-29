import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { differenceInHours, parse } from "date-fns";

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

    const logoElement = parent.find(".search-entity-media img");
    const companyLogo =
      logoElement.attr("src") ||
      logoElement.attr("data-delayed-url") ||
      logoElement.attr("data-ghost-url");

    const companyLocation = $(element)
      .find(".base-search-card__metadata .job-search-card__location")
      .text()
      .trim();

    const timeAgo =
      $(element).find(".job-search-card__listdate").text().trim() ||
      $(element).find(".job-search-card__listdate--new").text().trim();

    linkedinJobs.push({
      jobNo: index + 1,
      title: jobTitle,
      company: {
        name: companyName,
        location: companyLocation,
        logo: companyLogo,
      },
      posted: timeAgo,
      link: jobLink,
      source: "LinkedIn",
    });
  });

  return linkedinJobs.filter((f) => !f.title.includes("***"));
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

    const companyLogo = $(element).find(".cardone__body--img img").attr("src");

    const jobLink = $(element).find(".description__two--foot a").attr("href");

    kumariJobs.push({
      jobNo: index + 1,
      title: jobTitle,
      company: {
        name: companyName,
        logo: companyLogo,
      },
      deadline: deadline,
      link: jobLink,
      source: "Kumari Jobs",
    });
  });

  return kumariJobs;
};

export const scrapeMeroJobsService = async (keywords) => {
  const url = `https://merojob.com/search/?q=${keywords}`;

  const content = await openBrowser(url);

  const $ = cheerio.load(content);

  const meroJobs = [];

  $("#search_job .card").each((index, element) => {
    const jobTitle = $(element).find(".text-left h1 a").text().trim();

    const companyName =
      $(element).find(".text-left h3 span").text().trim() ||
      $(element).find(".text-left h3 a").text().trim();

    const companyLogo = $(element).find(".card-body img").attr("src");
    const finalCompanyLogo = `https://merojob.com${companyLogo}`;

    const companyLocation = $(element)
      .find('[itemprop="addressLocality"]')
      .text()
      .trim();

    const deadline = $(element)
      .find('.card-footer meta[itemprop="validThrough"]')
      .attr("content");

    // get time left from deadline
    let formattedDeadline;

    if (!deadline) {
      formattedDeadline = "";
    } else {
      const parsedDeadline = parse(
        deadline,
        "MMMM d, yyyy, h:mm a",
        new Date()
      );
      const now = new Date();
      if (parsedDeadline < now) {
        formattedDeadline = "Deadline Passed";
      } else {
        const totalHours = differenceInHours(parsedDeadline, now);
        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;

        let result = "";
        if (days > 0) result += `${days} day${days > 1 ? "s" : ""} `;
        if (hours > 0) result += `${hours} hour${hours > 1 ? "s" : ""}`;
        formattedDeadline = `${result} left`;
      }
    }

    const link = $(element).find(".text-left h1 a").attr("href");
    const jobLink = `https://merojob.com${link}`;

    meroJobs.push({
      jobNo: index + 1,
      title: jobTitle,
      company: {
        name: companyName,
        logo: finalCompanyLogo,
        location: companyLocation,
      },
      deadline: formattedDeadline,
      link: jobLink,
      source: "Mero Jobs",
    });
  });

  return meroJobs.filter((f) => !!f.title);
};
