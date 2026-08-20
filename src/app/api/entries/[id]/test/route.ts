import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResolutionStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const entry = await prisma.knowledgeEntry.findFirst({
      where: { OR: [{ id }, { slug: id }, { readableId: id }] },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const testRecord = await prisma.resolutionHistory.create({
      data: {
        entryId: entry.id,
        testedAt: body.testedAt ? new Date(body.testedAt) : new Date(),
        testerName: body.testerName || "Engineer",
        environment: body.environment || entry.environment || "Production",
        resultStatus: (body.resultStatus as ResolutionStatus) || ResolutionStatus.SUCCESS,
        notes: body.notes || "Test de validation exécuté avec succès.",
      },
    });

    // Update entry's lastTestedAt and validation state
    await prisma.knowledgeEntry.update({
      where: { id: entry.id },
      data: {
        lastTestedAt: testRecord.testedAt,
        validationTested: testRecord.resultStatus === ResolutionStatus.SUCCESS,
        validationEnvironment: testRecord.environment,
      },
    });

    await prisma.auditLog.create({
      data: {
        userName: body.testerName || "Engineer",
        action: "RESOLUTION_TESTED",
        entityType: "ENTRY",
        entityId: entry.id,
        details: JSON.stringify({
          readableId: entry.readableId,
          status: testRecord.resultStatus,
          environment: testRecord.environment,
        }),
      },
    });

    return NextResponse.json({ success: true, testRecord }, { status: 201 });
  } catch (error: any) {
    console.error("Error logging test resolution:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
