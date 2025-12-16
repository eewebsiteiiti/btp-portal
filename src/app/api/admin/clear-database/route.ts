import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.assignedProject.deleteMany({});
    await prisma.preference.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.professor.deleteMany({});
    await prisma.adminControls.deleteMany({});

    return NextResponse.json({ message: "Database cleared successfully." });
  } catch (error) {
    console.error("Error clearing database:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to clear the database.", error: errorMessage },
      { status: 500 }
    );
  }
}
