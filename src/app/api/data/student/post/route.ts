import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const name = data.name;

    if (!name) {
      return NextResponse.json(
        { message: "Supervisor name is required" },
        { status: 400 }
      );
    }

    const students = await prisma.student.findMany({
      include: {
        preferences: {
          include: { project: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    const processed: { [key: string]: Set<string> } = {};

    for (const student of students) {
      for (const preference of student.preferences) {
        if (preference.project?.supervisor === name) {
          const key = preference.project.title;

          const studentGroup = [student];

          // Check for group
          if (preference.isGroup && preference.partnerRollNumber) {
            const partner = students.find(
              (s) => s.rollNo === preference.partnerRollNumber
            );
            if (partner) {
              studentGroup.push(partner);
            }
          }

          // Sort for consistency
          studentGroup.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

          const groupKey = JSON.stringify(
            studentGroup.map((s) => ({
              id: s.id,
              rollNo: s.rollNo,
              name: s.name,
              email: s.email,
            }))
          );

          if (!processed[key]) {
            processed[key] = new Set();
          }
          processed[key].add(groupKey);
        }
      }
    }

    // Convert Sets to Arrays for JSON serialization
    const result = Object.fromEntries(
      Object.entries(processed).map(([key, value]) => [
        key,
        Array.from(value).map((str) => JSON.parse(str)),
      ])
    );

    return NextResponse.json(
      { message: "POST request received", processed: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error processing request", error: errorMessage },
      { status: 500 }
    );
  }
}
