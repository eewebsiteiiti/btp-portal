import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface PreferenceInput {
  project: string;
  isGroup?: boolean;
  partnerRollNumber?: string;
  status?: string;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { preferences } = data;

    if (!Array.isArray(preferences) || preferences.length === 0) {
      return NextResponse.json(
        { message: "Invalid preferences data" },
        { status: 400 }
      );
    }

    const projectIds = (preferences as PreferenceInput[]).map((pref) => pref.project);

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
    });

    const orderedProjects = (preferences as PreferenceInput[]).map((pref) => {
      const project = projects.find((p) => p.id === pref.project);
      return project
        ? {
            project,
            isGroup: pref.isGroup || false,
            partnerRollNumber: pref.partnerRollNumber || "",
            status: pref.status || "Pending",
          }
        : null;
    });

    return NextResponse.json({ projects: orderedProjects.filter(Boolean) });
  } catch (error) {
    console.error("Error fetching projects by preference:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error fetching projects", error: errorMessage },
      { status: 500 }
    );
  }
}
