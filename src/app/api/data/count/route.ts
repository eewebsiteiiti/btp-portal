import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [students, professors, projects, projectDetails] = await Promise.all([
      prisma.student.count(),
      prisma.professor.count(),
      prisma.project.count(),
      prisma.project.findMany({
        select: { dropProject: true, capacity: true },
      }),
    ]);

    let activeProjects = 0;
    let nonDroppedCapacity = 0;

    projectDetails.forEach((p) => {
      if (!p.dropProject) {
        activeProjects++;
        nonDroppedCapacity += p.capacity;
      }
    });

    const droppedProjects = projects - activeProjects;

    return NextResponse.json(
      {
        message: "GET count request received",
        students,
        professors,
        projects,
        drops: activeProjects, // Active projects (not dropped)
        nonDroppedCounts: droppedProjects, // Dropped projects
        nonDroppedCapacity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting counts:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error getting counts", error: errorMessage },
      { status: 500 }
    );
  }
}
