import pdfParse from "pdf-parse";
import natural from "natural";
import { removeStopwords } from "stopword";
//import { mapData, skillAliasMap } from "../constants/data.js";
import network from "./brain.js";

const data = await import('/etc/secrets/data.js');
const { mapData, skillAliasMap } = data;

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

// function categorizeData(data) {
//   let categories = {
//     skills: null,
//     // experience: null, //todo: calculate experience logic
//     keywords: null,
//   };

//   // const stemmer = natural.PorterStemmer;

//   const allFilteredData = tokenizeAndStem(data).filtered;

//   const filteredSkills = tokenizeAndStem(
//     scoreCategories.skills.join(" ")
//   ).filtered;

//   const filteredKeywords = tokenizeAndStem(
//     scoreCategories.keywords.join(" ")
//   ).filtered;

//   const keywordsIncludingSkills = [...filteredSkills, ...filteredKeywords];

//   categories.skills = new Set(
//     allFilteredData.filter((word) => filteredSkills.includes(word))
//   );
//   categories.keywords = new Set(
//     allFilteredData.filter((word) => keywordsIncludingSkills.includes(word))
//   );

//   // categories.keywords = new Set(
//   //   allFilteredData.filter((word) => {
//   //     const stem = stemmer.stem(word);
//   //     return keywordsIncludingSkills.includes(stem);
//   //   })
//   // );

//   return categories;
// }

function categorizeData(data) {
  const categories = {
    skills: [],
    keywords: [],
  };

  const roles = {};

  const filtered = tokenizeAndStem(data).filtered;

  filtered.filter(Boolean).forEach((word) => {
    const input = { [word]: 1 };

    const output = network.run(input);

    const [topMatch, confidence] = Object.entries(output).reduce(
      (max, curr) => (curr[1] > max[1] ? curr : max),
      ["", 0]
    );

    // calculate total number of role matches
    if (confidence > 0.3 && topMatch !== "Soft Skill") {
      if (!roles[topMatch]) {
        roles[topMatch] = 1;
      } else {
        roles[topMatch] += 1;
      }
    }

    if (confidence > 0.3 && mapData.skills.includes(topMatch)) {
      categories.skills.push(word);
    }
    if (confidence > 0.3 && mapData.keywords.includes(topMatch)) {
      categories.keywords.push(word);
    }
  });

  const rolesArr = Object.entries(roles);

  // Default values if no roles are found
  let role1 = "";
  let value1 = 0;
  let role2 = "";
  let value2 = 0;

  // Safely access first role if it exists
  if (rolesArr.length > 0) {
    role1 = rolesArr[0][0];
    value1 = rolesArr[0][1];
  }

  // Safely access second role if it exists
  if (rolesArr.length > 1) {
    role2 = rolesArr[1][0];
    value2 = rolesArr[1][1];
  }

  const isFrontendBackendPair =
    (role1 === "Frontend Developer" && role2 === "Backend Developer") ||
    (role1 === "Backend Developer" && role2 === "Frontend Developer");

  const isFullStackDeveloper =
    isFrontendBackendPair && Math.abs(value1 - value2) <= 3;

  // If no roles were detected, return "Unknown" instead of empty string
  const finalRole = isFullStackDeveloper
    ? "Full Stack Developer"
    : role1 || "Unknown";

  return { categories, finalRole };
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

  // Convert similarity score to percentage with 2 decimal places
  return magA && magB ? Number(((dot / (magA * magB)) * 100).toFixed(2)) : 0;
}

function normalizeSkill(skill) {
  return skillAliasMap[skill.toLowerCase()] || skill.toLowerCase();
}

function getNormalizedIntersection(setA, setB) {
  const normalizedA = new Set([...setA].map(normalizeSkill));
  const normalizedB = new Set([...setB].map(normalizeSkill));

  const intersection = new Set(
    [...normalizedA].filter((item) => normalizedB.has(item))
  );

  return intersection;
}

export function getMatchedData(jobDescription, resume) {
  const categorizedJD = categorizeData(jobDescription).categories;
  const categorizedResume = categorizeData(resume).categories;

  const matchedSkills = getNormalizedIntersection(
    categorizedJD.skills,
    categorizedResume.skills
  );
  const matchedKeywords = getNormalizedIntersection(
    categorizedJD.keywords,
    categorizedResume.keywords
  );

  const skillsPercentageMatch = Number(
    (
      ([...matchedSkills].length / (categorizedJD.skills.length || 1)) *
      100
    ).toFixed(2)
  );

  const keywordsPercentageMatch = Number(
    (
      ([...matchedKeywords].length / (categorizedJD.keywords.length || 1)) *
      100
    ).toFixed(2)
  );

  const matchedRole = categorizeData(resume).finalRole;

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
    matchedRole,
  };
}
