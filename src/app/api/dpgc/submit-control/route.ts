import { NextResponse, NextRequest } from "next/server";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    let controls = await prisma.mtpAdminControls.findUnique({
      where: { domain },
    });

    if (!controls) {
      controls = await prisma.mtpAdminControls.create({
        data: { domain },
      });
    }

    return NextResponse.json(controls);
  } catch (error) {
    console.error("Error fetching MTP admin controls:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch MTP admin controls", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { type, enabled, domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const isNumeric = NUMERIC_CONTROL_TYPES.includes(type);
    if (!type || (isNumeric ? typeof enabled !== "number" : typeof enabled !== "boolean")) {
      return NextResponse.json(
        { error: "Type and enabled (boolean or number) are required" },
        { status: 400 }
      );
    }

    if (!VALID_CONTROL_TYPES.includes(type as ControlType)) {
      return NextResponse.json({ error: "Invalid control type" }, { status: 400 });
    }

    let controls = await prisma.mtpAdminControls.findUnique({
      where: { domain },
    });

    if (!controls) {
      controls = await prisma.mtpAdminControls.create({
        data: { domain, [type]: enabled },
      });
    } else {
      controls = await prisma.mtpAdminControls.update({
        where: { domain },
        data: { [type]: enabled },
      });
    }

    return NextResponse.json({ success: true, controls });
  } catch (error) {
    console.error("Error updating MTP admin controls:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update MTP admin controls", details: errorMessage },
      { status: 500 }
    );
  }
}
