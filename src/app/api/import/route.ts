import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseImportFileContent } from "@/lib/export-import";
import { findSimilarEntries } from "@/lib/similarity";
import { calculateQualityScore } from "@/lib/quality";
import { EntryStatus, ConfidenceLevel, RootCauseCategory, KnowledgeEntryDto } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mode = formData.get("mode") as string | null; // "preview" or "execute"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let fileType: "json" | "csv" | "xlsx" = "json";
    if (fileName.endsWith(".csv")) fileType = "csv";
    else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) fileType = "xlsx";

    const arrayBuffer = await file.arrayBuffer();
    const rawRows = parseImportFileContent(arrayBuffer, fileType);

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json({ error: "Empty or invalid file content" }, { status: 400 });
    }

    // Fetch existing entries for duplicate detection
    const existingEntries = await prisma.knowledgeEntry.findMany({
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    const existingDtos: KnowledgeEntryDto[] = existingEntries.map((e) => ({
      ...e,
      technologies: (() => {
        try {
          return JSON.parse(e.technologies);
        } catch {
          return [];
        }
      })(),
      tools: (() => {
        try {
          return JSON.parse(e.tools);
        } catch {
          return [];
        }
      })(),
      affectedSystems: [],
      affectedProjects: [],
      tags: e.tags.map((t) => t.tag),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      lastTestedAt: e.lastTestedAt?.toISOString() || null,
    }));

    const normalizedItems: Array<any> = [];
    const validationErrors: Array<{ row: number; error: string }> = [];

    // Categories map
    const categories = await prisma.category.findMany();
    const defaultCategory = categories[0] || (await prisma.category.create({
      data: { name: "Général", slug: "general" },
    }));

    let rowIndex = 0;
    for (const row of rawRows) {
      rowIndex++;
      const title = row.title || row.Titre || row["Titre du problème"] || row.titre;
      const symptoms = row.symptoms || row.Symptômes || row.symptomes || row.Symptomes || row.description || row.Problem || "";
      const quickSolution = row.quickSolution || row["Solution Rapide"] || row.solution || row.Solution || "";
      const errorMessage = row.errorMessage || row["Message d'erreur"] || row.error || row.Message_Erreur || "";
      const rootCause = row.rootCause || row["Cause Racine"] || row.cause || row.Cause_Racine || "";
      const environment = row.environment || row.Environnement || "Production";

      if (!title || !symptoms || !quickSolution) {
        validationErrors.push({
          row: rowIndex,
          error: `Ligne ${rowIndex} ignorée : 'title', 'symptoms' ou 'quickSolution' manquant.`,
        });
        continue;
      }

      // Check duplicates
      const duplicates = findSimilarEntries(
        { title, errorMessage, symptoms, rootCause },
        existingDtos,
        60 // high threshold
      );

      normalizedItems.push({
        title: String(title).trim(),
        symptoms: String(symptoms).trim(),
        quickSolution: String(quickSolution).trim(),
        errorMessage: String(errorMessage).trim(),
        rootCause: String(rootCause || "Non spécifiée").trim(),
        environment: String(environment).trim(),
        categoryName: row.categoryName || row.Catégorie || row.category || defaultCategory.name,
        duplicates,
        raw: row,
      });
    }

    // If mode is preview, return validated items and duplicate warnings
    if (mode === "preview") {
      return NextResponse.json({
        totalParsed: rawRows.length,
        validCount: normalizedItems.length,
        errors: validationErrors,
        previewItems: normalizedItems.slice(0, 10),
      });
    }

    // Execute Import
    let importedCount = 0;
    let baseCount = await prisma.knowledgeEntry.count();

    for (const item of normalizedItems) {
      baseCount++;
      const readableId = `KB-${1000 + baseCount}`;
      const slug =
        item.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-") +
        "-" +
        Math.floor(1000 + Math.random() * 9000);

      let cat = categories.find((c) => c.name.toLowerCase() === item.categoryName.toLowerCase());
      if (!cat) {
        cat = defaultCategory;
      }

      const quality = calculateQualityScore({
        title: item.title,
        symptoms: item.symptoms,
        errorMessage: item.errorMessage,
        rootCause: item.rootCause,
        quickSolution: item.quickSolution,
        validationTested: true,
      });

      const entry = await prisma.knowledgeEntry.create({
        data: {
          readableId,
          title: item.title,
          slug,
          status: "VALIDATED",
          confidenceLevel: "VALIDATED",
          authorName: "Imported via File",
          qualityScore: quality.score,
          categoryId: cat.id,
          environment: item.environment || "Production",
          technologies: JSON.stringify([]),
          tools: JSON.stringify([]),
          affectedSystems: JSON.stringify([]),
          affectedProjects: JSON.stringify([]),
          problemDescription: item.symptoms,
          contextDescription: "",
          symptoms: item.symptoms,
          errorMessage: item.errorMessage,
          triggerConditions: "",
          rootCause: item.rootCause,
          rootCauseCategory: "CONFIGURATION",
          quickSolution: item.quickSolution,
          validationTested: true,
          validationEnvironment: item.environment,
          validationResult: "Importé avec succès",
        },
      });

      // If commands provided in CSV/row
      const commandStr = item.raw.commands || item.raw.Commandes || item.raw.command;
      if (commandStr && typeof commandStr === "string") {
        const parts = commandStr.split(/\n---\n| \| /);
        for (const cmd of parts) {
          if (cmd.trim()) {
            await prisma.commandSnippet.create({
              data: {
                entryId: entry.id,
                language: "bash",
                command: cmd.trim(),
                description: "Commande importée",
              },
            });
          }
        }
      }

      importedCount++;
    }

    await prisma.auditLog.create({
      data: {
        userName: "Engineer",
        action: "IMPORTED",
        entityType: "IMPORT",
        details: JSON.stringify({
          fileName: file.name,
          importedCount,
          errorsCount: validationErrors.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      importedCount,
      errors: validationErrors,
    });
  } catch (error: any) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
