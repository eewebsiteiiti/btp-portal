import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE() {
  try {
    // Disconnect projects from professors first
    await prisma.project.updateMany({
      data: { professorId: null },
    });

    // Delete all professors
    const result = await prisma.professor.deleteMany({});

    return NextResponse.json(
      { message: "All professors deleted successfully", count: result.count },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting professors:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error deleting professors", error: errorMessage },
      { status: 500 }
    );
  }
}
