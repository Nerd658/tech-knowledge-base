import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { EntryStatus, ConfidenceLevel } from "@prisma/client";

export async function GET() {
  try {
    const [
      totalEntries,
      validatedEntries,
      unresolvedEntries,
      draftEntries,
      categories,
      tags,
      topViewed,
      recentEntries,
      recentAudit,
    ] = await Promise.all([
      prisma.knowledgeEntry.count(),
      prisma.knowledgeEntry.count({
        where: {
          status: EntryStatus.VALIDATED,
          confidenceLevel: ConfidenceLevel.VALIDATED,
        },
      }),
      prisma.knowledgeEntry.count({
        where: {
          OR: [
            { status: EntryStatus.UNRESOLVED },
            { confidenceLevel: ConfidenceLevel.UNRESOLVED },
          ],
        },
      }),
      prisma.knowledgeEntry.count({
        where: { status: EntryStatus.DRAFT },
      }),
      prisma.category.findMany({
        include: {
          _count: {
            select: { entries: true },
          },
        },
        orderBy: {
          entries: { _count: "desc" },
        },
        take: 8,
      }),
      prisma.tag.findMany({
        include: {
          _count: {
            select: { entries: true },
          },
        },
        orderBy: {
          entries: { _count: "desc" },
        },
        take: 10,
      }),
      prisma.knowledgeEntry.findMany({
        orderBy: { viewCount: "desc" },
        take: 5,
        select: {
          id: true,
          readableId: true,
          title: true,
          slug: true,
          viewCount: true,
          status: true,
          qualityScore: true,
          category: { select: { name: true } },
        },
      }),
      prisma.knowledgeEntry.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    // Aggregate technologies
    const allEntriesTech = await prisma.knowledgeEntry.findMany({
      select: { technologies: true },
    });

    const techCounts: Record<string, number> = {};
    for (const item of allEntriesTech) {
      try {
        const parsed = JSON.parse(item.technologies);
        if (Array.isArray(parsed)) {
          for (const tech of parsed) {
            const clean = tech.trim();
            if (clean) {
              techCounts[clean] = (techCounts[clean] || 0) + 1;
            }
          }
        }
      } catch {}
    }

    const sortedTech = Object.entries(techCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const formattedRecent = recentEntries.map((e) => ({
      ...e,
      technologies: (() => {
        try {
          return JSON.parse(e.technologies);
        } catch {
          return [];
        }
      })(),
      tags: e.tags.map((t) => t.tag),
    }));

    return NextResponse.json({
      stats: {
        total: totalEntries,
        validated: validatedEntries,
        unresolved: unresolvedEntries,
        drafts: draftEntries,
        resolvedRate: totalEntries > 0 ? Math.round((validatedEntries / totalEntries) * 100) : 0,
      },
      categoriesDistribution: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c._count.entries,
      })),
      technologiesDistribution: sortedTech,
      topTags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color,
        count: t._count.entries,
      })),
      topViewed,
      recentEntries: formattedRecent,
      recentAudit,
    });
  } catch (error: any) {
    console.error("Error generating stats:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
