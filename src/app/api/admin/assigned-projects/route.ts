import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const assignedProjects = await prisma.assignedProject.findMany({
      include: {
        student: true,
        project: true,
      },
    });

    // Group students by project
    const projectStudentGroupMap: { [key: string]: string[] } = {};

    assignedProjects.forEach((assignment) => {
      if (!projectStudentGroupMap[assignment.projectId]) {
        projectStudentGroupMap[assignment.projectId] = [];
      }
      projectStudentGroupMap[assignment.projectId].push(assignment.studentId);
    });

    return NextResponse.json({
      message: "Success",
      data: projectStudentGroupMap,
    });
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error fetching assigned projects", error: errorMessage },
      { status: 500 }
    );
  }
}
