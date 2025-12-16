import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.roll_no) {
      return NextResponse.json(
        { message: "Roll number is required", groupBreak: false },
        { status: 400 }
      );
    }

    const checkStudent = await prisma.student.findUnique({
      where: { rollNo: data.roll_no },
      include: {
        preferences: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!checkStudent) {
      return NextResponse.json(
        { message: "Student not found", groupBreak: false },
        { status: 404 }
      );
    }

    // Get all students who have submitted preferences
    const students = await prisma.student.findMany({
      where: { submitStatus: true },
      include: {
        preferences: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    for (const student of students) {
      for (const preference of student.preferences) {
        // Check if this student has the check_student as a group partner
        if (
          preference.isGroup &&
          preference.partnerRollNumber === checkStudent.rollNo
        ) {
          // Found a potential group - check if check_student has a different partner for same project
          const checkPreference = checkStudent.preferences.find(
            (p) => p.projectId === preference.projectId
          );

          if (
            checkPreference &&
            checkPreference.partnerRollNumber !== student.rollNo
          ) {
            return NextResponse.json({
              message: "Group Break",
              groupBreak: true,
            });
          }
        }
      }
    }

    return NextResponse.json({ message: "No group break", groupBreak: false });
  } catch (error) {
    console.error("Error checking group break:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error checking group break", error: errorMessage, groupBreak: false },
      { status: 500 }
    );
  }
}
