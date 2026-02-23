import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "asc" },
      include: { professor: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(
      { message: "GET request received", projects },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error fetching projects", error: errorMessage },
      { status: 500 }
    );
  }
}
