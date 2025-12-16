import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Test route to initialize professor and student preferences
export async function GET() {
  try {
    const professors = await prisma.professor.findMany({
      include: { projects: true },
    });

    const students = await prisma.student.findMany({
      include: { preferences: true },
    });

    const projects = await prisma.project.findMany();

    // Fill professor preferences
    for (const professor of professors) {
      const studentsPreference: Record<string, string[][]> = {};

      for (const project of professor.projects) {
        // Shuffle students for random ordering
        const shuffledStudents = shuffleArray(students);
        studentsPreference[project.id] = shuffledStudents.map((student) => [student.id]);
      }

      await prisma.professor.update({
        where: { id: professor.id },
        data: {
          studentsPreference: JSON.stringify(studentsPreference),
          submitStatus: true,
        },
      });
    }

    // Fill student preferences (randomize project order)
    for (const student of students) {
      // Shuffle projects to randomize preference order
      const shuffledProjects = shuffleArray(projects);

      // Delete existing preferences
      await prisma.preference.deleteMany({
        where: { studentId: student.id },
      });

      // Create new randomized preferences
      await prisma.preference.createMany({
        data: shuffledProjects.map((project, index) => ({
          studentId: student.id,
          projectId: project.id,
          orderIndex: index,
          isGroup: false,
          partnerRollNumber: "",
          status: "Pending",
        })),
      });

      // Mark student as submitted
      await prisma.student.update({
        where: { id: student.id },
        data: { submitStatus: true },
      });
    }

    return NextResponse.json({
      message: "Success - filled preferences for professors and students",
      data: {
        professors: professors.length,
        students: students.length,
      },
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
