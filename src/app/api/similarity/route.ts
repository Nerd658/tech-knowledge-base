import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findSimilarEntries } from "@/lib/similarity";
import { KnowledgeEntryDto } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, errorMessage, symptoms, rootCause, technologies, excludeId, threshold } = body;

    if (!title && !errorMessage && !symptoms && !rootCause) {
      return NextResponse.json({ matches: [] });
    }

    // Fetch all entries for candidate matching
    const entries = await prisma.knowledgeEntry.findMany({
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    const candidateDtos: KnowledgeEntryDto[] = entries.map((entry) => ({
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
      affectedSystems: [],
      affectedProjects: [],
      tags: entry.tags.map((t) => t.tag),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      lastTestedAt: entry.lastTestedAt?.toISOString() || null,
    }));

    const matches = findSimilarEntries(
      {
        title,
        errorMessage,
        symptoms,
        rootCause,
        technologies,
        excludeId,
      },
      candidateDtos,
      threshold || 20
    );

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error("Error finding similar entries:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
