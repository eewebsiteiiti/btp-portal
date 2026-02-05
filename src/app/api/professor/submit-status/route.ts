import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { professorId, submitStatus } = await req.json();

    if (!professorId || typeof submitStatus !== "boolean") {
      return NextResponse.json(
        { message: "professorId and submitStatus (boolean) are required" },
        { status: 400 }
      );
    }

    await prisma.professor.update({
      where: { id: professorId },
      data: { submitStatus },
    });

    return NextResponse.json(
      { message: `Submit status updated to ${submitStatus}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating submit status:", error);
    return NextResponse.json(
      { message: "Error updating submit status" },
      { status: 500 }
    );
  }
}
