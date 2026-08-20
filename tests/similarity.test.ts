import { tokenize, calculateJaccardSimilarity, calculateNgramOverlap, findSimilarEntries } from "../src/lib/similarity";
import { KnowledgeEntryDto } from "../src/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log("=== Running Similarity Engine Tests ===");

// 1. Tokenizer tests
const tokens = tokenize("Wazuh Manager ne reçoit plus les logs UDP 1514");
assert(tokens.includes("wazuh"), "Tokens should contain 'wazuh'");
assert(tokens.includes("manager"), "Tokens should contain 'manager'");
assert(tokens.includes("logs"), "Tokens should contain 'logs'");
assert(tokens.includes("udp"), "Tokens should contain 'udp'");
assert(tokens.includes("1514"), "Tokens should contain '1514'");
assert(!tokens.includes("les"), "Stop words like 'les' should be filtered out");
assert(!tokens.includes("ne"), "Stop words like 'ne' should be filtered out");

// 2. Jaccard Similarity tests
const simHigh = calculateJaccardSimilarity(["wazuh", "logs", "agent"], ["wazuh", "logs", "agent", "manager"]);
assert(simHigh >= 0.7, `Jaccard similarity should be high (got ${simHigh})`);

const simZero = calculateJaccardSimilarity(["nginx", "ssl"], ["postgres", "lock"]);
assert(simZero === 0, `Jaccard similarity should be 0 for disjoint sets (got ${simZero})`);

// 3. Ngram / Substring overlap tests
const errOverlap = calculateNgramOverlap("Connection refused", "Connection refused on port 1514");
assert(errOverlap >= 0.8, `Error message substring match should have high score (got ${errOverlap})`);

// 4. Duplicate / "J'ai déjà vu ça" Detection
const mockCandidate: KnowledgeEntryDto = {
  id: "test-1",
  readableId: "KB-1001",
  title: "Wazuh Manager ne reçoit plus les logs des agents",
  slug: "wazuh-manager-ne-recoit-plus-les-logs-des-agents",
  status: "VALIDATED",
  confidenceLevel: "VALIDATED",
  authorName: "Admin",
  isFavorite: false,
  viewCount: 10,
  qualityScore: 90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categoryId: "cat-1",
  environment: "Production",
  technologies: ["Wazuh", "Linux", "UDP"],
  tools: ["wazuh-manager"],
  affectedSystems: [],
  affectedProjects: [],
  problemDescription: "Les agents sont actifs mais ne communiquent pas.",
  contextDescription: "Ubuntu 22.04",
  symptoms: "Les agents ne transmettent plus leurs événements",
  errorMessage: "Connection refused on UDP port 1514",
  triggerConditions: "Mise à jour firewall",
  rootCause: "Le port UDP 1514 était bloqué",
  rootCauseCategory: "FIREWALL" as any,
  quickSolution: "Ouvrir le port UDP 1514",
  validationTested: true,
  hasRegression: false,
};

const matches = findSimilarEntries(
  {
    title: "Wazuh logs not received",
    errorMessage: "Connection refused",
    symptoms: "Agents unable to send logs",
  },
  [mockCandidate],
  20
);

assert(matches.length === 1, `Should find 1 matching entry (found ${matches.length})`);
assert(matches[0].similarityScore >= 35, `Similarity score should be >= 35% (got ${matches[0].similarityScore}%)`);
console.log(`Matched entry with score: ${matches[0].similarityScore}%, fields:`, matches[0].matchedFields);

console.log("=== All Similarity Tests Passed Successfully! ===");
