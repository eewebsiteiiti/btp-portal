import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_CONTROL_TYPES = [
  "submitEnableStudentProjects",
  "submitEnableProfessorStudents",
  "projectViewEnableStudent",
  "studentViewEnableProfessor",
  "studentViewResult",
  "professorViewResult",
  "minCapacity",
  "maxCapacity",
] as const;

const NUMERIC_CONTROL_TYPES: readonly string[] = ["minCapacity", "maxCapacity"];

type ControlType = (typeof VALID_CONTROL_TYPES)[number];

export async function GET() {
  try {
    let controls = await prisma.adminControls.findFirst();

    if (!controls) {
      // Create default settings if they don't exist
      controls = await prisma.adminControls.create({
        data: {},
      });
    }

    return NextResponse.json(controls);
  } catch (error) {
    console.error("Error fetching admin controls:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch admin controls", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { type, enabled } = await req.json();

    const isNumeric = NUMERIC_CONTROL_TYPES.includes(type);
    if (!type || (isNumeric ? typeof enabled !== "number" : typeof enabled !== "boolean")) {
      return NextResponse.json(
        { error: "Type and enabled (boolean or number) are required" },
        { status: 400 }
      );
    }

    if (!VALID_CONTROL_TYPES.includes(type as ControlType)) {
      return NextResponse.json(
        { error: "Invalid control type" },
        { status: 400 }
      );
    }

    // Find existing controls or create default if not found
    let controls = await prisma.adminControls.findFirst();

    if (!controls) {
      controls = await prisma.adminControls.create({
        data: { [type]: enabled },
      });
    } else {
      controls = await prisma.adminControls.update({
        where: { id: controls.id },
        data: { [type]: enabled },
      });
    }

    return NextResponse.json({ success: true, controls });
  } catch (error) {
    console.error("Error updating admin controls:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update admin controls", details: errorMessage },
      { status: 500 }
    );
  }
}
