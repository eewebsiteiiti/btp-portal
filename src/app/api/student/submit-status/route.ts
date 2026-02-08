import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { studentId, submitStatus } = await req.json();

    if (!studentId || typeof submitStatus !== "boolean") {
      return NextResponse.json(
        { error: "studentId and submitStatus (boolean) are required" },
        { status: 400 }
      );
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { submitStatus },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating submit status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update submit status", details: errorMessage },
      { status: 500 }
    );
  }
}
