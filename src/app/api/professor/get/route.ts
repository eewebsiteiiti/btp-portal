import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (email) {
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

      // Parse studentsPreference from JSON string
      const professorWithParsedPrefs = {
        ...professor,
        studentsPreference: JSON.parse(professor.studentsPreference),
      };

      return NextResponse.json(
        { message: "GET request received", professor: professorWithParsedPrefs },
        { status: 200 }
      );
    }

    const professors = await prisma.professor.findMany({
      include: { projects: true },
    });

    // Parse studentsPreference for all professors
    const professorsWithParsedPrefs = professors.map((prof) => ({
      ...prof,
      studentsPreference: JSON.parse(prof.studentsPreference),
    }));

    return NextResponse.json(
      { message: "GET request received", professors: professorsWithParsedPrefs },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching professors:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error fetching professors", error: errorMessage },
      { status: 500 }
    );
  }
}
