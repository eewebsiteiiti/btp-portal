import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.assignedProject.deleteMany({});

    return NextResponse.json(
      { message: "Allotment reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting allotment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error resetting allotment", error: errorMessage },
      { status: 500 }
    );
  }
}
