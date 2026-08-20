import { KnowledgeEntryDto } from "@/types";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export function formatEntryToMarkdown(entry: KnowledgeEntryDto): string {
  const tagsFormatted = (entry.tags || []).map((t) => `#${t.name}`).join(" ");
  const dateFormatted = entry.createdAt
    ? new Date(entry.createdAt).toLocaleDateString("fr-FR")
    : "N/A";
  const lastTestedFormatted = entry.lastTestedAt
    ? new Date(entry.lastTestedAt).toLocaleDateString("fr-FR")
    : "Non testé";

  let md = `==================================================
${entry.readableId} — ${entry.title.toUpperCase()}
==================================================

Catégorie : ${entry.category?.name || "Non classé"}
Environnement : ${entry.environment}
Technologies : ${(entry.technologies || []).join(", ") || "N/A"}
Tags : ${tagsFormatted || "Aucun"}
Statut : ${entry.status} (${entry.confidenceLevel})
Créé le : ${dateFormatted} | Dernier test : ${lastTestedFormatted}

--------------------------------------------------
1. SYMPTÔME & PROBLÈME
--------------------------------------------------
${entry.symptoms}

Description détaillée :
${entry.problemDescription || "N/A"}

Message d'erreur :
${entry.errorMessage || "N/A"}

Conditions d'apparition :
${entry.triggerConditions || "N/A"}

--------------------------------------------------
2. CAUSE RACINE (Root Cause Analysis)
--------------------------------------------------
Catégorie : ${entry.rootCauseCategory}
Composant responsable : ${entry.responsibleComponent || "Non spécifié"}
Facteur déclencheur : ${entry.triggerFactor || "Non spécifié"}

Explication :
${entry.rootCause}
${entry.secondaryCauses ? `\nCauses secondaires :\n${entry.secondaryCauses}` : ""}

--------------------------------------------------
3. SOLUTION RAPIDE (Quick Fix)
--------------------------------------------------
${entry.quickSolution}

--------------------------------------------------
4. COMMANDES & SNIPPETS
--------------------------------------------------
`;

  if (entry.commands && entry.commands.length > 0) {
    entry.commands.forEach((cmd, idx) => {
      md += `\n### [${cmd.language.toUpperCase()}] ${cmd.description || `Commande ${idx + 1}`}\n`;
      if (cmd.context) md += `*Contexte : ${cmd.context}*\n`;
      md += `\`\`\`${cmd.language}\n${cmd.command}\n\`\`\`\n`;
      if (cmd.expectedOutput) {
        md += `*Résultat attendu :*\n\`\`\`text\n${cmd.expectedOutput}\n\`\`\`\n`;
      }
    });
  } else {
    md += `\nAucune commande enregistrée.\n`;
  }

  if (entry.resolutionSteps && entry.resolutionSteps.length > 0) {
    md += `\n--------------------------------------------------\n5. PROCÉDURE DÉTAILLÉE DE RÉSOLUTION\n--------------------------------------------------\n`;
    entry.resolutionSteps.forEach((step, idx) => {
      md += `\n### Étape ${step.stepNumber || idx + 1} — ${step.title}\n${step.description}\n`;
      if (step.command) {
        md += `\`\`\`bash\n${step.command}\n\`\`\`\n`;
      }
      if (step.expectedResult) {
        md += `*Résultat attendu :* ${step.expectedResult}\n`;
      }
      if (step.notes) {
        md += `*Notes :* ${step.notes}\n`;
      }
    });
  }

  if (entry.investigations && entry.investigations.length > 0) {
    md += `\n--------------------------------------------------\n6. INVESTIGATION & RAISONNEMENT\n--------------------------------------------------\n`;
    entry.investigations.forEach((inv, idx) => {
      md += `\n### Hypothèse ${inv.stepNumber || idx + 1} : ${inv.hypothesis}\n`;
      if (inv.command) md += `Commande test : \`${inv.command}\`\n`;
      if (inv.result) md += `Résultat : ${inv.result}\n`;
      md += `Conclusion : ${inv.conclusion}\n`;
    });
  }

  if (entry.resources && entry.resources.length > 0) {
    md += `\n--------------------------------------------------\n7. RESSOURCES & DOCUMENTATION\n--------------------------------------------------\n`;
    entry.resources.forEach((res) => {
      md += `- [${res.resourceType}] ${res.title}: ${res.url}\n`;
      if (res.description) md += `  ${res.description}\n`;
    });
  }

  md += `\n==================================================\n`;
  return md;
}

export function exportEntriesToJSON(entries: KnowledgeEntryDto[]): string {
  return JSON.stringify(entries, null, 2);
}

export function exportEntriesToCSV(entries: KnowledgeEntryDto[]): string {
  const flatData = entries.map((e) => ({
    ID: e.readableId,
    Titre: e.title,
    Statut: e.status,
    Confiance: e.confidenceLevel,
    Catégorie: e.category?.name || "",
    Environnement: e.environment,
    Technologies: (e.technologies || []).join("; "),
    Symptômes: e.symptoms,
    Message_Erreur: e.errorMessage,
    Cause_Racine: e.rootCause,
    Solution_Rapide: e.quickSolution,
    Commandes: (e.commands || []).map((c) => c.command).join(" | "),
    Score_Qualite: e.qualityScore,
    Date_Creation: e.createdAt,
  }));

  return Papa.unparse(flatData);
}

export function exportEntriesToExcelBuffer(entries: KnowledgeEntryDto[]): Uint8Array {
  const flatData = entries.map((e) => ({
    "ID Lisible": e.readableId,
    "Titre du problème": e.title,
    "Statut": e.status,
    "Niveau de confiance": e.confidenceLevel,
    "Catégorie": e.category?.name || "",
    "Environnement": e.environment,
    "Technologies": (e.technologies || []).join(", "),
    "Symptômes": e.symptoms,
    "Message d'erreur": e.errorMessage,
    "Catégorie Cause": e.rootCauseCategory,
    "Cause Racine": e.rootCause,
    "Solution Rapide": e.quickSolution,
    "Commandes": (e.commands || []).map((c) => c.command).join("\n---\n"),
    "Qualité (%)": e.qualityScore,
    "Créé le": e.createdAt,
    "Dernier test": e.lastTestedAt || "Non testé",
  }));

  const worksheet = XLSX.utils.json_to_sheet(flatData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Base de Connaissances");
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Uint8Array(buffer);
}

export function parseImportFileContent(
  content: string | ArrayBuffer,
  fileType: "json" | "csv" | "xlsx"
): Array<Record<string, any>> {
  if (fileType === "json") {
    if (typeof content !== "string") {
      content = new TextDecoder().decode(content);
    }
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  if (fileType === "csv") {
    if (typeof content !== "string") {
      content = new TextDecoder().decode(content);
    }
    const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
    return parsed.data as Array<Record<string, any>>;
  }

  if (fileType === "xlsx") {
    const workbook = XLSX.read(content, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  return [];
}
