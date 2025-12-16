import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface ProjectInput {
  Domain: string;
  Project_No: string;
  Title: string;
  Capacity: number;
  Nature_of_work: string;
  Comments: string;
  Supervisor: string;
  Cosupervisor?: string;
  Supervisor_email: string;
}

export async function POST(req: NextRequest) {
  try {
    let data = await req.json();
    data = data.data;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid data format. Expected an array of projects." },
        { status: 400 }
      );
    }

    const createdProjects = [];

    for (const project of data as ProjectInput[]) {
      // Validate required fields
      if (
        !project.Domain ||
        !project.Project_No ||
        !project.Title ||
        !project.Capacity ||
        !project.Nature_of_work ||
        !project.Comments ||
        !project.Supervisor ||
        !project.Supervisor_email
      ) {
        continue; // Skip invalid entries
      }

      // Find professor by email to link project
      const professor = await prisma.professor.findUnique({
        where: { email: project.Supervisor_email },
      });

      const createdProject = await prisma.project.create({
        data: {
          domain: project.Domain,
          projectNo: project.Project_No,
          title: project.Title,
          capacity: project.Capacity,
          natureOfWork: project.Nature_of_work,
          comments: project.Comments,
          supervisor: project.Supervisor,
          cosupervisor: project.Cosupervisor || null,
          supervisorEmail: project.Supervisor_email,
          dropProject: false,
          professorId: professor?.id || null,
        },
      });

      createdProjects.push(createdProject);
    }

    return NextResponse.json(
      { message: "Projects created successfully", projects: createdProjects },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating projects:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error creating projects", error: errorMessage },
      { status: 500 }
    );
  }
}
