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
    const body = await req.json();
    const data = body.data;
    const program = body.program || "BTP";

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid data format. Expected an array of projects." },
        { status: 400 }
      );
    }

    const createdProjects = [];

    for (const project of data as ProjectInput[]) {
      // Convert values to strings/numbers to handle Excel type variations
      const domain = String(project.Domain ?? "").trim();
      const projectNo = String(project.Project_No ?? "").trim();
      const title = String(project.Title ?? "").trim();
      const capacity = Number(project.Capacity) || 0;
      const natureOfWork = String(project.Nature_of_work ?? "").trim();
      const comments = String(project.Comments ?? "").trim();
      const supervisor = String(project.Supervisor ?? "").trim();
      const cosupervisor = project.Cosupervisor ? String(project.Cosupervisor).trim() : null;
      const supervisorEmail = String(project.Supervisor_email ?? "").trim();

      // Validate required fields
      if (
        !domain ||
        !projectNo ||
        !title ||
        !capacity ||
        !natureOfWork ||
        !supervisor ||
        !supervisorEmail
      ) {
        continue; // Skip invalid entries
      }

      // Find professor by email to link project
      const professor = await prisma.professor.findUnique({
        where: { email: supervisorEmail },
      });

      const createdProject = await prisma.project.create({
        data: {
          domain,
          projectNo,
          title,
          capacity,
          natureOfWork,
          comments,
          supervisor,
          cosupervisor,
          supervisorEmail,
          dropProject: false,
          professorId: professor?.id || null,
          program,
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
