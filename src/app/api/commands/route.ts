import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const language = searchParams.get("language");

    const where: any = {};

    if (language) {
      where.language = { equals: language, mode: "insensitive" };
    }

    if (q) {
      where.OR = [
        { command: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { context: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
      ];
    }

    const commands = await prisma.commandSnippet.findMany({
      where,
      include: {
        entry: {
          select: {
            id: true,
            readableId: true,
            title: true,
            slug: true,
            environment: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = commands.map((cmd) => ({
      ...cmd,
      tags: (() => {
        try {
          return JSON.parse(cmd.tags);
        } catch {
          return [];
        }
      })(),
    }));

    return NextResponse.json({ commands: formatted });
  } catch (error: any) {
    console.error("Error fetching commands:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
