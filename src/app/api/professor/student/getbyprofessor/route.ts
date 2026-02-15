import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const professor = await prisma.professor.findUnique({
      where: { email },
      include: { projects: true },
    });

    if (!professor) {
      return NextResponse.json(
        { message: "Professor not found" },
        { status: 404 }
      );
    }

    const students = await prisma.student.findMany({
      include: {
        preferences: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    const projectDetails = await prisma.project.findMany({
      where: {
        id: { in: professor.projects.map((p) => p.id) },
      },
    });

    // Build rollNo -> student map for O(1) partner lookup
    const studentsByRollNo = new Map(students.map((s) => [s.rollNo, s]));

    // Build project-wise students map
    const projectWiseStudents: {
      [key: string]: { [key: number]: Set<string> };
    } = {};

    for (const project of professor.projects) {
      projectWiseStudents[project.id] = {};
      // Track students already added for this project to avoid duplicate groups
      const addedStudentIds = new Set<string>();

      for (const student of students) {
        if (addedStudentIds.has(student.id)) continue;

        for (let i = 0; i < student.preferences.length; i++) {
          const prefer = student.preferences[i];

          if (prefer.projectId === project.id) {
            const studentGroup = [student];

            // If it's a group preference with success status, find partner
            if (prefer.isGroup && prefer.status === "Success") {
              const partner = studentsByRollNo.get(prefer.partnerRollNumber!);
              if (partner && !addedStudentIds.has(partner.id)) {
                studentGroup.push(partner);
              }
            }

            // Sort for consistency
            studentGroup.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

            // Mark all students in the group as added
            studentGroup.forEach((s) => addedStudentIds.add(s.id));

            const setObject = JSON.stringify(
              studentGroup.map((s) => ({
                id: s.id,
                _id: s.id, // For backwards compatibility
                rollNo: s.rollNo,
                roll_no: s.rollNo, // For backwards compatibility
                name: s.name,
                email: s.email,
                cpi: s.cpi,
                submitStatus: s.submitStatus,
              }))
            );

            if (!projectWiseStudents[project.id][i]) {
              projectWiseStudents[project.id][i] = new Set<string>();
            }
            projectWiseStudents[project.id][i].add(setObject);
          }
        }
      }
    }

    // Convert Sets to Arrays
    const data = Object.fromEntries(
      Object.entries(projectWiseStudents).map(([projectId, preferences]) => [
        projectId,
        Object.fromEntries(
          Object.entries(preferences).map(([rank, studentSet]) => [
            rank,
            Array.from(studentSet).map((str) => JSON.parse(str)),
          ])
        ),
      ])
    );

    return NextResponse.json(
      { message: "Data retrieved successfully", data, projectDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting students by professor:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error retrieving data", error: errorMessage },
      { status: 500 }
    );
  }
}
