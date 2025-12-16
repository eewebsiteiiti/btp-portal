import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE() {
  try {
    // Delete all preferences first (due to foreign key constraint)
    await prisma.preference.deleteMany({});

    // Delete all assigned projects
    await prisma.assignedProject.deleteMany({});

    // Delete all students
    const result = await prisma.student.deleteMany({});

    return NextResponse.json(
      { message: "All students deleted successfully", count: result.count },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting students:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error deleting students", error: errorMessage },
      { status: 500 }
    );
  }
}
