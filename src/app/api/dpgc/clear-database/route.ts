import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // Get all MTP student IDs and project IDs
    const mtpStudents = await prisma.student.findMany({
      where: { program: "MTP" },
      select: { id: true },
    });
    const mtpStudentIds = mtpStudents.map((s) => s.id);

    const mtpProjects = await prisma.project.findMany({
      where: { program: "MTP" },
      select: { id: true },
    });
    const mtpProjectIds = mtpProjects.map((p) => p.id);

    // Delete in order to respect foreign key constraints
    await prisma.assignedProject.deleteMany({
      where: { studentId: { in: mtpStudentIds } },
    });
    await prisma.preference.deleteMany({
      where: { studentId: { in: mtpStudentIds } },
    });
    await prisma.student.deleteMany({ where: { program: "MTP" } });
    await prisma.project.deleteMany({ where: { program: "MTP" } });
    await prisma.mtpAdminControls.deleteMany({});
    await prisma.programCoordinator.deleteMany({});

    // Reset professor MTP preferences
    await prisma.professor.updateMany({
      data: {
        mtpStudentsPreference: "{}",
        mtpSubmitStatus: false,
      },
    });

    return NextResponse.json({ message: "MTP database cleared successfully." });
  } catch (error) {
    console.error("Error clearing MTP database:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to clear MTP database.", error: errorMessage },
      { status: 500 }
    );
  }
}
