import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program") || "BTP";
    const domain = searchParams.get("domain");

    const studentWhere: { program: string; domain?: string } = { program };
    if (domain) studentWhere.domain = domain;

    const projectWhere: { program: string; domain?: string } = { program };
    if (domain) projectWhere.domain = domain;

    const [students, professors, projects, projectDetails] = await Promise.all([
      prisma.student.count({ where: studentWhere }),
      prisma.professor.count(),
      prisma.project.count({ where: projectWhere }),
      prisma.project.findMany({
        where: projectWhere,
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
