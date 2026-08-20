import {
  formatEntryToMarkdown,
  exportEntriesToJSON,
  exportEntriesToCSV,
  exportEntriesToExcelBuffer,
  parseImportFileContent,
} from "../src/lib/export-import";
import { KnowledgeEntryDto } from "../src/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log("=== Running Export / Import Tests ===");

const sampleEntry: KnowledgeEntryDto = {
  id: "entry-123",
  readableId: "KB-1001",
  title: "Wazuh Manager ne reçoit plus les logs",
  slug: "wazuh-manager-logs",
  status: "VALIDATED",
  confidenceLevel: "VALIDATED",
  authorName: "Admin",
  isFavorite: true,
  viewCount: 15,
  qualityScore: 95,
  createdAt: new Date("2026-08-18T10:00:00Z").toISOString(),
  updatedAt: new Date("2026-08-18T10:00:00Z").toISOString(),
  lastTestedAt: new Date("2026-08-18T10:00:00Z").toISOString(),
  categoryId: "cat-1",
  category: { id: "cat-1", name: "Sécurité", slug: "securite" },
  environment: "Production",
  technologies: ["Wazuh", "Linux"],
  tools: ["iptables"],
  affectedSystems: [],
  affectedProjects: [],
  problemDescription: "Problème de communication entre agents et manager.",
  contextDescription: "Ubuntu 22.04 LTS",
  symptoms: "Les logs ne remontent plus",
  errorMessage: "Connection refused",
  triggerConditions: "Firewall restart",
  rootCause: "Port UDP 1514 bloqué",
  rootCauseCategory: "FIREWALL" as any,
  quickSolution: "Autoriser UDP/1514 sur iptables",
  validationTested: true,
  hasRegression: false,
  commands: [
    {
      language: "bash",
      command: "iptables -A INPUT -p udp --dport 1514 -j ACCEPT",
      description: "Ouvrir port 1514",
    },
  ],
};

// 1. Markdown Export Test
const md = formatEntryToMarkdown(sampleEntry);
assert(md.includes("KB-1001 — WAZUH MANAGER NE REÇOIT PLUS LES LOGS"), "Markdown should have formatted title banner");
assert(md.includes("1. SYMPTÔME & PROBLÈME"), "Markdown should include symptoms section");
assert(md.includes("iptables -A INPUT -p udp --dport 1514 -j ACCEPT"), "Markdown should include executable commands");

// 2. JSON Export Test
const jsonStr = exportEntriesToJSON([sampleEntry]);
const parsedJson = JSON.parse(jsonStr);
assert(Array.isArray(parsedJson) && parsedJson[0].readableId === "KB-1001", "JSON export should roundtrip cleanly");

// 3. CSV Export Test
const csvStr = exportEntriesToCSV([sampleEntry]);
assert(csvStr.includes("KB-1001"), "CSV export should contain readableId");
assert(csvStr.includes("Wazuh Manager"), "CSV export should contain title");

// 4. Excel Export Buffer Test
const xlsxBuffer = exportEntriesToExcelBuffer([sampleEntry]);
assert(xlsxBuffer.length > 100, `Excel buffer should be non-empty (got ${xlsxBuffer.length} bytes)`);

// 5. Parse Import Content Test
const importedFromCsv = parseImportFileContent(csvStr, "csv");
assert(importedFromCsv.length === 1, `Should parse 1 row from CSV (got ${importedFromCsv.length})`);
assert(importedFromCsv[0].ID === "KB-1001", "Imported row should have ID KB-1001");

console.log("=== All Export / Import Tests Passed Successfully! ===");
