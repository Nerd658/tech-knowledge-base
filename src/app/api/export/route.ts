import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  formatEntryToMarkdown,
  exportEntriesToJSON,
  exportEntriesToCSV,
  exportEntriesToExcelBuffer,
} from "@/lib/export-import";
import { KnowledgeEntryDto } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "json").toLowerCase();
    const entryId = searchParams.get("id");
    const categoryId = searchParams.get("categoryId");
    const technology = searchParams.get("technology");

    const where: any = {};
    if (entryId) {
      where.OR = [{ id: entryId }, { readableId: entryId }, { slug: entryId }];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (technology) {
      where.technologies = { contains: technology, mode: "insensitive" };
    }

    const entries = await prisma.knowledgeEntry.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        commands: true,
        resolutionSteps: { orderBy: { order: "asc" } },
        investigations: { orderBy: { stepNumber: "asc" } },
        resources: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedDtos: KnowledgeEntryDto[] = entries.map((entry) => ({
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
      commands: entry.commands.map((cmd) => ({
        ...cmd,
        tags: (() => {
          try {
            return JSON.parse(cmd.tags);
          } catch {
            return [];
          }
        })(),
      })),
      tags: entry.tags.map((t) => t.tag),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      lastTestedAt: entry.lastTestedAt?.toISOString() || null,
    }));

    // Log export audit
    await prisma.auditLog.create({
      data: {
        userName: "Engineer",
        action: "EXPORTED",
        entityType: "EXPORT",
        details: JSON.stringify({
          format,
          count: formattedDtos.length,
          singleEntry: entryId || null,
        }),
      },
    });

    if (format === "markdown" || format === "md") {
      if (formattedDtos.length === 1) {
        const md = formatEntryToMarkdown(formattedDtos[0]);
        return new NextResponse(md, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="${formattedDtos[0].readableId}.md"`,
          },
        });
      }

      const allMd = formattedDtos.map((e) => formatEntryToMarkdown(e)).join("\n\n\n");
      return new NextResponse(allMd, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="tech-knowledge-base-export.md"`,
        },
      });
    }

    if (format === "csv") {
      const csv = exportEntriesToCSV(formattedDtos);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="tech-knowledge-base-export.csv"`,
        },
      });
    }

    if (format === "xlsx" || format === "excel") {
      const buffer = exportEntriesToExcelBuffer(formattedDtos);
      return new NextResponse(Buffer.from(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="tech-knowledge-base-export.xlsx"`,
        },
      });
    }

    // Default JSON
    const json = exportEntriesToJSON(formattedDtos);
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="tech-knowledge-base-export.json"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting entries:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
