import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // Get MTP student IDs for this domain
    const students = await prisma.student.findMany({
      where: { program: "MTP", domain },
      select: { id: true },
    });
    const studentIds = students.map((s) => s.id);

    await prisma.assignedProject.deleteMany({
      where: { studentId: { in: studentIds } },
    });

    return NextResponse.json(
      { message: "MTP allotment reset successfully for domain: " + domain },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting MTP allotment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error resetting allotment", error: errorMessage },
      { status: 500 }
    );
  }
}
