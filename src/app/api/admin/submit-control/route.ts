import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import AdminControls from "@/models/AdminControls";

export async function GET() {
  await dbConnect();

  try {
    const controls = await AdminControls.findOne();

    if (!controls) {
      // Create default settings if they don't exist
      const newControls = await AdminControls.create({});
      return NextResponse.json(newControls);
    }

    return NextResponse.json(controls);
  } catch (error) {
    console.error("Error fetching admin controls:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin controls" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { type, enabled } = await req.json();

    // Find existing controls or create default if not found
    let controls = await AdminControls.findOne();
    if (!controls) {
      controls = new AdminControls();
    }

    switch (type) {
      case "submitEnableStudentProjects":
        controls.submitEnableStudentProjects = enabled;
        break;
      case "submitEnableProfessorStudents":
        controls.submitEnableProfessorStudents = enabled;
        break;
      case "projectViewEnableStudent":
        controls.projectViewEnableStudent = enabled;
        break;
      case "studentViewEnableProfessor":
        controls.studentViewEnableProfessor = enabled;
        break;
      case "studentViewResult":
        controls.studentViewResult = enabled;
        break;
      case "professorViewResult":
        controls.professorViewResult = enabled;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid control type" },
          { status: 400 }
        );
    }

    await controls.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating admin controls:", error);
    return NextResponse.json(
      { error: "Failed to update admin controls" },
      { status: 500 }
    );
  }
}
