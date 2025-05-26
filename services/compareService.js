import pdfParse from "pdf-parse";
import natural from "natural";
import { removeStopwords } from "stopword";
import { scoreCategories } from "../constants/scoreCategories.js";

export const parsePdf = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer, { max: 2 });

    // const pages = data.text.split("\f");
    // console.log(typeof pages);

    const cleanedText = data.text
      .replace(/[ \t]+/g, " ")
      .replace(/\r?\n/g, " ")
      .trim();

    return cleanedText;
  } catch (error) {
    throw new Error("Failed to extract text from PDF");
  }
};

// calculate cosine similarity...
function tokenizeAndStem(text) {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/);
  const filtered = removeStopwords(tokens);
  return {
    filtered,
    stemmed: filtered.map((token) => natural.PorterStemmer.stem(token)),
  };
}

function categorizeData(data) {
  let categories = {
    skills: null,
    // experience: null, //todo: calculate experience logic
    keywords: null,
  };

  const stemmer = natural.PorterStemmer;

  const allFilteredData = tokenizeAndStem(data).filtered;

  const filteredSkills = tokenizeAndStem(
    scoreCategories.skills.join(" ")
  ).filtered;
  const stemmedKeywords = tokenizeAndStem(
    scoreCategories.keywords.join(" ")
  ).stemmed;

  categories.skills = new Set(
    allFilteredData.filter((word) => filteredSkills.includes(word))
  );
  categories.keywords = new Set(
    allFilteredData.filter((word) => {
      const stem = stemmer.stem(word);
      return stemmedKeywords.includes(stem);
    })
  );

  return categories;
}

export function calculateSimilarity(jobDescription, resume) {
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(tokenizeAndStem(jobDescription).stemmed.join(" "));
  tfidf.addDocument(tokenizeAndStem(resume).stemmed.join(" "));

  const vecA = tfidf.listTerms(0).reduce((acc, t) => {
    acc[t.term] = t.tfidf;
    return acc;
  }, {});
  const vecB = tfidf.listTerms(1).reduce((acc, t) => {
    acc[t.term] = t.tfidf;
    return acc;
  }, {});

  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  const dot = Array.from(allTerms).reduce((sum, term) => {
    return sum + (vecA[term] || 0) * (vecB[term] || 0);
  }, 0);

  const magA = Math.sqrt(
    Object.values(vecA).reduce((sum, val) => sum + val * val, 0)
  );
  const magB = Math.sqrt(
    Object.values(vecB).reduce((sum, val) => sum + val * val, 0)
  );

  return magA && magB ? dot / (magA * magB) : 0;
}

export function getMatchedData(jobDescription, resume) {
  const categorizedJD = categorizeData(jobDescription);
  const categorizedResume = categorizeData(resume);

  const matchedSkills = categorizedJD.skills.intersection(
    categorizedResume.skills
  );
  const matchedKeywords = categorizedJD.keywords.intersection(
    categorizedResume.keywords
  );

  const skillsPercentageMatch =
    ([...matchedSkills].length / [...categorizedJD.skills].length) * 100;

  const keywordsPercentageMatch =
    ([...matchedKeywords].length / [...categorizedJD.keywords].length) * 100;

  return {
    skillsMatch: {
      allSkillsInJD: [...categorizedJD.skills],
      matchedSkills: [...matchedSkills],
      percentageMatch: skillsPercentageMatch,
    },
    keywordsMatch: {
      allKeywordsInJD: [...categorizedJD.keywords],
      matchedKeywords: [...matchedKeywords],
      percentageMatch: keywordsPercentageMatch,
    },
  };
}
