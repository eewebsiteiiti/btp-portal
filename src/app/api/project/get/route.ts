import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program") || "BTP";
    const domain = searchParams.get("domain");

    const where: { program: string; domain?: string } = { program };
    if (domain) where.domain = domain;

    const projects = await prisma.project.findMany({
      where,
      include: { professor: { select: { id: true, name: true, email: true } } },
    });

    projects.sort((a, b) => {
      const numA = parseInt(a.projectNo.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.projectNo.replace(/\D/g, "")) || 0;
      return numA - numB;
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
