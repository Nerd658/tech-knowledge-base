import { SimilarityMatch, KnowledgeEntryDto } from "@/types";

const STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "d", "et", "en", "au", "aux",
  "avec", "dans", "par", "pour", "sur", "pas", "plus", "ne", "se", "ce", "ces",
  "qui", "que", "quoi", "dont", "ou", "mais", "donc", "or", "ni", "car", "mon",
  "ton", "son", "notre", "votre", "leur", "est", "sont", "ete", "avoir", "etre",
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with",
  "by", "about", "against", "between", "into", "through", "during", "before",
  "after", "above", "below", "from", "up", "down", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "not"
]);

export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
}

export function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersectionCount = 0;

  setA.forEach((item) => {
    if (setB.has(item)) {
      intersectionCount++;
    }
  });

  const unionSize = setA.size + setB.size - intersectionCount;
  if (unionSize === 0) return 0;
  return intersectionCount / unionSize;
}

export function calculateNgramOverlap(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  const normA = textA.toLowerCase().trim();
  const normB = textB.toLowerCase().trim();
  if (normA === normB) return 1.0;
  if (normA.includes(normB) || normB.includes(normA)) return 0.85;

  const wordsA = tokenize(textA);
  const wordsB = tokenize(textB);
  return calculateJaccardSimilarity(wordsA, wordsB);
}

export interface SimilarityQueryInput {
  title?: string;
  errorMessage?: string;
  symptoms?: string;
  rootCause?: string;
  technologies?: string[];
  excludeId?: string;
}

export function findSimilarEntries(
  input: SimilarityQueryInput,
  candidateEntries: KnowledgeEntryDto[],
  threshold = 20
): SimilarityMatch[] {
  const inputTitleTokens = tokenize(input.title || "");
  const inputErrorTokens = tokenize(input.errorMessage || "");
  const inputSymptomsTokens = tokenize(input.symptoms || "");
  const inputCauseTokens = tokenize(input.rootCause || "");
  const inputTechSet = new Set((input.technologies || []).map((t) => t.toLowerCase()));

  const matches: SimilarityMatch[] = [];

  for (const entry of candidateEntries) {
    if (input.excludeId && entry.id === input.excludeId) {
      continue;
    }

    const matchedFields: string[] = [];
    let weightedScore = 0;

    // 1. Error Message similarity (High weight: 35%)
    if (input.errorMessage && entry.errorMessage) {
      const errSim = calculateNgramOverlap(input.errorMessage, entry.errorMessage);
      if (errSim > 0.15) {
        weightedScore += errSim * 35;
        matchedFields.push(`Erreur (${Math.round(errSim * 100)}%)`);
      }
    }

    // 2. Title similarity (Weight: 25%)
    if (input.title && entry.title) {
      const titleTokens = tokenize(entry.title);
      const titleSim = calculateJaccardSimilarity(inputTitleTokens, titleTokens);
      if (titleSim > 0.15) {
        weightedScore += titleSim * 25;
        matchedFields.push(`Titre (${Math.round(titleSim * 100)}%)`);
      }
    }

    // 3. Symptoms similarity (Weight: 20%)
    if (input.symptoms && entry.symptoms) {
      const sympTokens = tokenize(entry.symptoms);
      const sympSim = calculateJaccardSimilarity(inputSymptomsTokens, sympTokens);
      if (sympSim > 0.15) {
        weightedScore += sympSim * 20;
        matchedFields.push(`Symptômes (${Math.round(sympSim * 100)}%)`);
      }
    }

    // 4. Root Cause similarity (Weight: 10%)
    if (input.rootCause && entry.rootCause) {
      const causeTokens = tokenize(entry.rootCause);
      const causeSim = calculateJaccardSimilarity(inputCauseTokens, causeTokens);
      if (causeSim > 0.15) {
        weightedScore += causeSim * 10;
        matchedFields.push(`Cause racine (${Math.round(causeSim * 100)}%)`);
      }
    }

    // 5. Technologies match (Weight: 10%)
    if (inputTechSet.size > 0 && entry.technologies && entry.technologies.length > 0) {
      let commonTech = 0;
      for (const tech of entry.technologies) {
        if (inputTechSet.has(tech.toLowerCase())) {
          commonTech++;
        }
      }
      if (commonTech > 0) {
        const techScore = commonTech / Math.max(inputTechSet.size, entry.technologies.length);
        weightedScore += techScore * 10;
        matchedFields.push(`Technologies communes (${commonTech})`);
      }
    }

    // Normalize final score to 0 - 100
    const finalScore = Math.min(100, Math.round(weightedScore));

    if (finalScore >= threshold) {
      matches.push({
        id: entry.id,
        readableId: entry.readableId,
        title: entry.title,
        slug: entry.slug,
        categoryName: entry.category?.name || "Général",
        similarityScore: finalScore,
        matchedFields,
        quickSolution: entry.quickSolution,
        rootCause: entry.rootCause,
        symptoms: entry.symptoms,
        status: entry.status,
      });
    }
  }

  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}
