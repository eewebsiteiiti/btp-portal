import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Test route to initialize professor student preferences
export async function GET() {
  try {
    const professors = await prisma.professor.findMany({
      include: { projects: true },
    });

    const students = await prisma.student.findMany();

    for (const professor of professors) {
      const studentsPreference: Record<string, string[][]> = {};

      for (const project of professor.projects) {
        // Initialize with all students as individual preferences
        studentsPreference[project.id] = students.map((student) => [student.id]);
      }

      await prisma.professor.update({
        where: { id: professor.id },
        data: {
          studentsPreference: JSON.stringify(studentsPreference),
        },
      });
    }

    return NextResponse.json({
      message: "Success",
      data: professors.length,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error processing request", error: errorMessage },
      { status: 500 }
    );
  }
}
