import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // Get MTP students for this domain
    const students = await prisma.student.findMany({
      where: { program: "MTP", domain },
      select: { id: true },
    });
    const studentIds = students.map((s) => s.id);

    // Get MTP projects for this domain
    const projects = await prisma.project.findMany({
      where: { program: "MTP", domain },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    // Clear preferences for MTP students in this domain
    await prisma.preference.deleteMany({
      where: { studentId: { in: studentIds } },
    });

    // Reset MTP student submit status
    await prisma.student.updateMany({
      where: { program: "MTP", domain },
      data: { submitStatus: false },
    });

    // Reset professor MTP preferences for projects in this domain
    const professorsWithProjects = await prisma.professor.findMany({
      where: { projects: { some: { id: { in: projectIds } } } },
    });

    for (const prof of professorsWithProjects) {
      const mtpPrefs = JSON.parse(prof.mtpStudentsPreference) as Record<string, unknown>;
      for (const projectId of projectIds) {
        delete mtpPrefs[projectId];
      }
      await prisma.professor.update({
        where: { id: prof.id },
        data: { mtpStudentsPreference: JSON.stringify(mtpPrefs) },
      });
    }

    return NextResponse.json({
      message: "MTP preferences cleared for domain: " + domain,
    });
  } catch (error) {
    console.error("Error clearing MTP preferences:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error clearing preferences", error: errorMessage },
      { status: 500 }
    );
  }
}
