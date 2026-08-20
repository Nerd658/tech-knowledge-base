import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const entry = await prisma.knowledgeEntry.findFirst({
      where: { OR: [{ id }, { slug: id }, { readableId: id }] },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const updated = await prisma.knowledgeEntry.update({
      where: { id: entry.id },
      data: { isFavorite: !entry.isFavorite },
    });

    return NextResponse.json({ success: true, isFavorite: updated.isFavorite });
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
