import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // Clear all student preferences
    await prisma.preference.deleteMany({});

    // Reset student submit status
    await prisma.student.updateMany({
      data: {
        submitStatus: false,
      },
    });

    // Clear professor student preferences and reset submit status
    await prisma.professor.updateMany({
      data: {
        studentsPreference: "{}",
        submitStatus: false,
      },
    });

    return NextResponse.json({
      message: "All preferences cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing preferences:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error clearing preferences", error: errorMessage },
      { status: 500 }
    );
  }
}
