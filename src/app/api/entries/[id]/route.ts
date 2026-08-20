import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateQualityScore } from "@/lib/quality";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const entry = await prisma.knowledgeEntry.findFirst({
      where: {
        OR: [{ id }, { slug: id }, { readableId: id }],
      },
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
        sourceRelations: {
          include: { targetEntry: true },
        },
        targetRelations: {
          include: { sourceEntry: true },
        },
        resolutionHistories: {
          orderBy: { testedAt: "desc" },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
        },
        comments: {
          orderBy: { createdAt: "desc" },
        },
        attachments: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Increment view count asynchronously
    await prisma.knowledgeEntry.update({
      where: { id: entry.id },
      data: { viewCount: { increment: 1 } },
    });

    const formattedEntry = {
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
      relations: [
        ...entry.sourceRelations.map((r) => ({
          id: r.id,
          targetEntryId: r.targetEntryId,
          targetTitle: r.targetEntry.title,
          targetReadableId: r.targetEntry.readableId,
          relationType: r.relationType,
          notes: r.notes,
        })),
        ...entry.targetRelations.map((r) => ({
          id: r.id,
          targetEntryId: r.sourceEntryId,
          targetTitle: r.sourceEntry.title,
          targetReadableId: r.sourceEntry.readableId,
          relationType: r.relationType,
          notes: r.notes,
        })),
      ],
    };

    return NextResponse.json(formattedEntry);
  } catch (error: any) {
    console.error("Error retrieving entry:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.knowledgeEntry.findFirst({
      where: { OR: [{ id }, { slug: id }, { readableId: id }] },
      include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const nextVersion = (existing.versions[0]?.versionNumber || 1) + 1;
    const qualityBreakdown = calculateQualityScore(body);

    // Save snapshot in version history
    await prisma.entryVersion.create({
      data: {
        entryId: existing.id,
        versionNumber: nextVersion,
        snapshotData: JSON.stringify(body),
        modifiedBy: body.authorName || "Engineer",
        changeSummary: body.changeSummary || `Mise à jour v${nextVersion}`,
      },
    });

    // Update main entry
    const updated = await prisma.knowledgeEntry.update({
      where: { id: existing.id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        status: body.status || existing.status,
        confidenceLevel: body.confidenceLevel || existing.confidenceLevel,
        authorName: body.authorName || existing.authorName,
        isFavorite: body.isFavorite !== undefined ? body.isFavorite : existing.isFavorite,
        qualityScore: qualityBreakdown.score,
        categoryId: body.categoryId || existing.categoryId,
        environment: body.environment || existing.environment,
        technologies: body.technologies ? JSON.stringify(body.technologies) : existing.technologies,
        tools: body.tools ? JSON.stringify(body.tools) : existing.tools,
        affectedSystems: body.affectedSystems ? JSON.stringify(body.affectedSystems) : existing.affectedSystems,
        affectedProjects: body.affectedProjects ? JSON.stringify(body.affectedProjects) : existing.affectedProjects,
        problemDescription: body.problemDescription !== undefined ? body.problemDescription : existing.problemDescription,
        contextDescription: body.contextDescription !== undefined ? body.contextDescription : existing.contextDescription,
        symptoms: body.symptoms !== undefined ? body.symptoms : existing.symptoms,
        errorMessage: body.errorMessage !== undefined ? body.errorMessage : existing.errorMessage,
        triggerConditions: body.triggerConditions !== undefined ? body.triggerConditions : existing.triggerConditions,
        rootCause: body.rootCause !== undefined ? body.rootCause : existing.rootCause,
        secondaryCauses: body.secondaryCauses !== undefined ? body.secondaryCauses : existing.secondaryCauses,
        responsibleComponent: body.responsibleComponent !== undefined ? body.responsibleComponent : existing.responsibleComponent,
        triggerFactor: body.triggerFactor !== undefined ? body.triggerFactor : existing.triggerFactor,
        rootCauseCategory: body.rootCauseCategory || existing.rootCauseCategory,
        quickSolution: body.quickSolution !== undefined ? body.quickSolution : existing.quickSolution,
        validationTested: body.validationTested !== undefined ? body.validationTested : existing.validationTested,
        validationEnvironment: body.validationEnvironment !== undefined ? body.validationEnvironment : existing.validationEnvironment,
        validationResult: body.validationResult !== undefined ? body.validationResult : existing.validationResult,
        hasRegression: body.hasRegression !== undefined ? body.hasRegression : existing.hasRegression,
        lastTestedAt: body.lastTestedAt ? new Date(body.lastTestedAt) : existing.lastTestedAt,
      },
    });

    // Update tags if provided
    if (body.tags && Array.isArray(body.tags)) {
      await prisma.tagsOnKnowledgeEntry.deleteMany({ where: { entryId: existing.id } });
      for (const tagName of body.tags) {
        const cleanName = tagName.replace(/^#/, "").trim().toLowerCase();
        if (!cleanName) continue;
        const tagObj = await prisma.tag.upsert({
          where: { slug: cleanName },
          update: {},
          create: { name: cleanName, slug: cleanName },
        });
        await prisma.tagsOnKnowledgeEntry.create({
          data: { entryId: existing.id, tagId: tagObj.id },
        });
      }
    }

    // Update commands if provided
    if (body.commands && Array.isArray(body.commands)) {
      await prisma.commandSnippet.deleteMany({ where: { entryId: existing.id } });
      for (const cmd of body.commands) {
        if (cmd.command && cmd.command.trim()) {
          await prisma.commandSnippet.create({
            data: {
              entryId: existing.id,
              language: cmd.language || "bash",
              command: cmd.command.trim(),
              description: cmd.description || "Commande",
              context: cmd.context || "",
              expectedOutput: cmd.expectedOutput || "",
              tags: JSON.stringify(cmd.tags || []),
            },
          });
        }
      }
    }

    // Update steps if provided
    if (body.resolutionSteps && Array.isArray(body.resolutionSteps)) {
      await prisma.resolutionStep.deleteMany({ where: { entryId: existing.id } });
      for (let i = 0; i < body.resolutionSteps.length; i++) {
        const step = body.resolutionSteps[i];
        await prisma.resolutionStep.create({
          data: {
            entryId: existing.id,
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

    // Update investigation if provided
    if (body.investigations && Array.isArray(body.investigations)) {
      await prisma.investigationStep.deleteMany({ where: { entryId: existing.id } });
      for (let i = 0; i < body.investigations.length; i++) {
        const inv = body.investigations[i];
        await prisma.investigationStep.create({
          data: {
            entryId: existing.id,
            stepNumber: inv.stepNumber || i + 1,
            hypothesis: inv.hypothesis || "",
            command: inv.command || "",
            result: inv.result || "",
            conclusion: inv.conclusion || "",
          },
        });
      }
    }

    // Update resources if provided
    if (body.resources && Array.isArray(body.resources)) {
      await prisma.resourceLink.deleteMany({ where: { entryId: existing.id } });
      for (const res of body.resources) {
        if (res.url && res.title) {
          await prisma.resourceLink.create({
            data: {
              entryId: existing.id,
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

    // Audit log
    await prisma.auditLog.create({
      data: {
        userName: body.authorName || "Engineer",
        action: "UPDATED",
        entityType: "ENTRY",
        entityId: existing.id,
        details: JSON.stringify({ readableId: existing.readableId, version: nextVersion }),
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error("Error updating entry:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await prisma.knowledgeEntry.findFirst({
      where: { OR: [{ id }, { slug: id }, { readableId: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.knowledgeEntry.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        userName: "Engineer",
        action: "DELETED",
        entityType: "ENTRY",
        entityId: existing.id,
        details: JSON.stringify({ readableId: existing.readableId, title: existing.title }),
      },
    });

    return NextResponse.json({ success: true, message: "Entry deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
