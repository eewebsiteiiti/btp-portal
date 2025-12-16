import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface ProfessorInput {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    let data = await req.json();
    data = data.data;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid data format. Expected an array of professors." },
        { status: 400 }
      );
    }

    const createdProfessors = [];

    for (const professor of data as ProfessorInput[]) {
      // Validate required fields
      if (!professor.name || !professor.email || !professor.password) {
        continue; // Skip invalid entries
      }

      // Find projects that belong to this professor
      const projects = await prisma.project.findMany({
        where: { supervisorEmail: professor.email },
        select: { id: true },
      });

      // Hash the password (FIX: professors now use hashed passwords)
      const hashedPassword = await bcrypt.hash(professor.password, 10);

      const createdProfessor = await prisma.professor.create({
        data: {
          name: professor.name,
          email: professor.email,
          password: hashedPassword,
          studentsPreference: "{}",
          projects: {
            connect: projects.map((p) => ({ id: p.id })),
          },
        },
        include: { projects: true },
      });

      createdProfessors.push(createdProfessor);
    }

    return NextResponse.json(
      { message: "Professors added successfully", professors: createdProfessors },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating professors:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error creating professors", error: errorMessage },
      { status: 500 }
    );
  }
}
