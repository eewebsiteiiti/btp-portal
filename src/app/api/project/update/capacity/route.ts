import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, capacity } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { message: "Invalid project ID" },
        { status: 400 }
      );
    }

    if (capacity !== 1 && capacity !== 2) {
      return NextResponse.json(
        { message: "Capacity must be 1 or 2" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    let groupsBroken = 0;

    // If reducing capacity from 2 to 1, break all group pairings
    if (project.capacity === 2 && capacity === 1) {
      // Find all group preferences for this project
      const groupPreferences = await prisma.preference.findMany({
        where: { projectId, isGroup: true },
      });

      if (groupPreferences.length > 0) {
        // Reset all group preferences to individual
        await prisma.preference.updateMany({
          where: { projectId, isGroup: true },
          data: {
            isGroup: false,
            partnerRollNumber: "",
            status: "Pending",
          },
        });

        groupsBroken = groupPreferences.length;
      }
    }

    // Update the project capacity
    await prisma.project.update({
      where: { id: projectId },
      data: { capacity },
    });

    return NextResponse.json(
      { success: true, groupsBroken },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating project capacity:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error updating project capacity", error: errorMessage },
      { status: 500 }
    );
  }
}
