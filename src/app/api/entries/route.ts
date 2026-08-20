import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateQualityScore } from "@/lib/quality";
import { EntryStatus, ConfidenceLevel, RootCauseCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId");
    const tag = searchParams.get("tag");
    const technology = searchParams.get("technology");
    const environment = searchParams.get("environment");
    const status = searchParams.get("status") as EntryStatus | null;
    const confidenceLevel = searchParams.get("confidenceLevel") as ConfidenceLevel | null;
    const isFavorite = searchParams.get("isFavorite") === "true";
    const sort = searchParams.get("sort") || "recent";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (environment) {
      where.environment = { equals: environment, mode: "insensitive" };
    }

    if (status) {
      where.status = status;
    }

    if (confidenceLevel) {
      where.confidenceLevel = confidenceLevel;
    }

    if (isFavorite) {
      where.isFavorite = true;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: { equals: tag.toLowerCase() },
          },
        },
      };
    }

    if (technology) {
      where.technologies = {
        contains: technology,
        mode: "insensitive",
      };
    }

    if (q.trim()) {
      const terms = q.trim().split(/\s+/).filter(Boolean);
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { readableId: { contains: q, mode: "insensitive" } },
        { errorMessage: { contains: q, mode: "insensitive" } },
        { symptoms: { contains: q, mode: "insensitive" } },
        { rootCause: { contains: q, mode: "insensitive" } },
        { quickSolution: { contains: q, mode: "insensitive" } },
        { problemDescription: { contains: q, mode: "insensitive" } },
        { technologies: { contains: q, mode: "insensitive" } },
        { tools: { contains: q, mode: "insensitive" } },
        {
          commands: {
            some: {
              OR: [
                { command: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
        ...terms.map((term) => ({
          title: { contains: term, mode: "insensitive" },
        })),
        ...terms.map((term) => ({
          errorMessage: { contains: term, mode: "insensitive" },
        })),
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "views") {
      orderBy = { viewCount: "desc" };
    } else if (sort === "score") {
      orderBy = { qualityScore: "desc" };
    } else if (sort === "title") {
      orderBy = { title: "asc" };
    } else if (sort === "lastTested") {
      orderBy = { lastTestedAt: "desc" };
    }

    const [total, entries] = await Promise.all([
      prisma.knowledgeEntry.count({ where }),
      prisma.knowledgeEntry.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
          commands: true,
          resolutionSteps: {
            orderBy: { order: "asc" },
          },
          investigations: {
            orderBy: { stepNumber: "asc" },
          },
          resources: true,
        },
      }),
    ]);

    const formattedEntries = entries.map((entry) => ({
      ...entry,
      technologies: (() => {
        try {
          return JSON.parse(entry.technologies);
        } catch {
          return [];
        }
      })(),
      tools: (() => {
        try {
          return JSON.parse(entry.tools);
        } catch {
          return [];
        }
      })(),
      affectedSystems: (() => {
        try {
          return JSON.parse(entry.affectedSystems);
        } catch {
          return [];
        }
      })(),
      affectedProjects: (() => {
        try {
          return JSON.parse(entry.affectedProjects);
        } catch {
          return [];
        }
      })(),
      tags: entry.tags.map((t) => t.tag),
    }));

    return NextResponse.json({
      entries: formattedEntries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching knowledge entries:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.symptoms || !body.quickSolution) {
      return NextResponse.json(
        { error: "Validation Error", message: "Le titre, les symptômes et la solution rapide sont obligatoires." },
        { status: 400 }
      );
    }

    // Generate readable ID
    const count = await prisma.knowledgeEntry.count();
    const readableId = `KB-${1001 + count}`;
    const slug = generateSlug(body.title);

    // Calculate quality score
    const qualityBreakdown = calculateQualityScore(body);

    // Ensure category exists
    let categoryId = body.categoryId;
    if (!categoryId) {
      const defaultCategory = await prisma.category.findFirst();
      if (defaultCategory) {
        categoryId = defaultCategory.id;
      } else {
        const createdCat = await prisma.category.create({
          data: {
            name: "Général",
            slug: "general",
            description: "Catégorie par défaut",
          },
        });
        categoryId = createdCat.id;
      }
    }

    const entry = await prisma.knowledgeEntry.create({
      data: {
        readableId,
        title: body.title.trim(),
        slug,
        status: body.status || EntryStatus.VALIDATED,
        confidenceLevel: body.confidenceLevel || ConfidenceLevel.VALIDATED,
        authorName: body.authorName || "Engineer",
        isFavorite: Boolean(body.isFavorite),
        qualityScore: qualityBreakdown.score,
        lastTestedAt: body.lastTestedAt ? new Date(body.lastTestedAt) : (body.validationTested ? new Date() : null),
        categoryId,
        environment: body.environment || "Production",
        technologies: JSON.stringify(body.technologies || []),
        tools: JSON.stringify(body.tools || []),
        affectedSystems: JSON.stringify(body.affectedSystems || []),
        affectedProjects: JSON.stringify(body.affectedProjects || []),
        problemDescription: body.problemDescription || body.symptoms || "",
        contextDescription: body.contextDescription || "",
        symptoms: body.symptoms.trim(),
        errorMessage: body.errorMessage || "",
        triggerConditions: body.triggerConditions || "",
        rootCause: body.rootCause || "Non spécifiée",
        secondaryCauses: body.secondaryCauses || "",
        responsibleComponent: body.responsibleComponent || "",
        triggerFactor: body.triggerFactor || "",
        rootCauseCategory: body.rootCauseCategory || RootCauseCategory.CONFIGURATION,
        quickSolution: body.quickSolution.trim(),
        validationTested: body.validationTested !== undefined ? body.validationTested : true,
        validationEnvironment: body.validationEnvironment || body.environment || "Production",
        validationResult: body.validationResult || "Validé",
        hasRegression: Boolean(body.hasRegression),
      },
    });

    // Create Tag relationships
    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
      for (const tagName of body.tags) {
        const cleanName = tagName.replace(/^#/, "").trim().toLowerCase();
        if (!cleanName) continue;
        const tagObj = await prisma.tag.upsert({
          where: { slug: cleanName },
          update: {},
          create: {
            name: cleanName,
            slug: cleanName,
          },
        });
        await prisma.tagsOnKnowledgeEntry.create({
          data: {
            entryId: entry.id,
            tagId: tagObj.id,
          },
        });
      }
    }

    // Create Commands
    if (body.commands && Array.isArray(body.commands)) {
      for (const cmd of body.commands) {
        if (cmd.command && cmd.command.trim()) {
          await prisma.commandSnippet.create({
            data: {
              entryId: entry.id,
              language: cmd.language || "bash",
              command: cmd.command.trim(),
              description: cmd.description || "Commande d'exécution",
              context: cmd.context || "",
              expectedOutput: cmd.expectedOutput || "",
              tags: JSON.stringify(cmd.tags || []),
            },
          });
        }
      }
    }

    // Create Resolution Steps
    if (body.resolutionSteps && Array.isArray(body.resolutionSteps)) {
      for (let i = 0; i < body.resolutionSteps.length; i++) {
        const step = body.resolutionSteps[i];
        if (step.title || step.description) {
          await prisma.resolutionStep.create({
            data: {
              entryId: entry.id,
              stepNumber: step.stepNumber || i + 1,
              title: step.title || `Étape ${i + 1}`,
              description: step.description || "",
              command: step.command || "",
              expectedResult: step.expectedResult || "",
              actualResult: step.actualResult || "",
              notes: step.notes || "",
              order: i + 1,
            },
          });
        }
      }
    }

    // Create Investigation Steps
    if (body.investigations && Array.isArray(body.investigations)) {
      for (let i = 0; i < body.investigations.length; i++) {
        const inv = body.investigations[i];
        if (inv.hypothesis || inv.conclusion) {
          await prisma.investigationStep.create({
            data: {
              entryId: entry.id,
              stepNumber: inv.stepNumber || i + 1,
              hypothesis: inv.hypothesis || "",
              command: inv.command || "",
              result: inv.result || "",
              conclusion: inv.conclusion || "",
            },
          });
        }
      }
    }

    // Create Resources
    if (body.resources && Array.isArray(body.resources)) {
      for (const res of body.resources) {
        if (res.url && res.title) {
          await prisma.resourceLink.create({
            data: {
              entryId: entry.id,
              title: res.title,
              url: res.url,
              resourceType: res.resourceType || "OFFICIAL_DOC",
              description: res.description || "",
              source: res.source || "",
            },
          });
        }
      }
    }

    // Initial Version
    await prisma.entryVersion.create({
      data: {
        entryId: entry.id,
        versionNumber: 1,
        snapshotData: JSON.stringify(body),
        modifiedBy: body.authorName || "Engineer",
        changeSummary: "Création initiale de la fiche de connaissance",
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userName: body.authorName || "Engineer",
        action: "CREATED",
        entityType: "ENTRY",
        entityId: entry.id,
        details: JSON.stringify({ readableId, title: entry.title }),
      },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
