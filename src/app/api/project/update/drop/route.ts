import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json(); // {id: boolean}

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const updatePromises = Object.entries(body).map(
      async ([projectId, drop]) => {
        await prisma.project.update({
          where: { id: projectId },
          data: { dropProject: drop as boolean },
        });
      }
    );

    await Promise.all(updatePromises);

    return NextResponse.json(
      { message: "Projects updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating projects:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error updating projects", error: errorMessage },
      { status: 500 }
    );
  }
}
