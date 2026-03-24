import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const program = searchParams.get("program") || "BTP";
    const domain = searchParams.get("domain");

    if (email) {
      const student = await prisma.student.findUnique({
        where: { email },
        include: {
          preferences: {
            orderBy: { orderIndex: "asc" },
            include: { project: true },
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          { message: "Student not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "GET request received", student },
        { status: 200 }
      );
    }

    // Build filter
    const where: { program: string; domain?: string } = { program };
    if (domain) where.domain = domain;

    // Get all students with their preferences
    const students = await prisma.student.findMany({
      where,
      include: {
        preferences: {
          orderBy: { orderIndex: "asc" },
          include: { project: true },
        },
      },
    });

    // Update group preference statuses
    for (const student of students) {
      for (const preference of student.preferences) {
        if (preference.isGroup && preference.partnerRollNumber) {
          const partner = await prisma.student.findUnique({
            where: { rollNo: preference.partnerRollNumber },
            include: {
              preferences: {
                orderBy: { orderIndex: "asc" },
              },
            },
          });

          if (partner) {
            const partnerPref = partner.preferences.find(
              (p) => p.projectId === preference.projectId
            );

            if (partnerPref) {
              const partnerPrefIndex = partner.preferences.findIndex(
                (p) => p.projectId === preference.projectId
              );

              const newStatus =
                partnerPrefIndex === preference.orderIndex && partnerPref.isGroup
                  ? "Success"
                  : "Pending";

              // Update both preferences if status changed
              if (preference.status !== newStatus) {
                await prisma.preference.update({
                  where: { id: preference.id },
                  data: { status: newStatus },
                });

                await prisma.preference.update({
                  where: { id: partnerPref.id },
                  data: { status: newStatus },
                });
              }
            }
          }
        }
      }
    }

    // Refetch students after updates
    const updatedStudents = await prisma.student.findMany({
      where,
      include: {
        preferences: {
          orderBy: { orderIndex: "asc" },
          include: { project: true },
        },
      },
    });

    return NextResponse.json(
      { message: "GET request received", students: updatedStudents },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error fetching students", error: errorMessage },
      { status: 500 }
    );
  }
}
