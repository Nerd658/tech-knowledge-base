import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      color: t.color,
      entryCount: t._count.entries,
    }));

    return NextResponse.json({ tags: formatted });
  } catch (error: any) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const cleanName = body.name.replace(/^#/, "").trim().toLowerCase();
    const tag = await prisma.tag.upsert({
      where: { slug: cleanName },
      update: {
        color: body.color || "#3b82f6",
      },
      create: {
        name: cleanName,
        slug: cleanName,
        color: body.color || "#3b82f6",
      },
    });

    return NextResponse.json({ success: true, tag }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
