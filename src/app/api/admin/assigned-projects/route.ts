import { dbConnect } from "@/lib/mongodb";
import AssignedProjects from "@/models/AssignedProjects";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // Fetch assigned projects, students, and projects
    const assignedProjects = await AssignedProjects.find({});
    const projectStudenGroupMap: { [key: string]: string[] } = {};
    assignedProjects.forEach((assignedProject) => {
      if (!projectStudenGroupMap[assignedProject.projectId])
        projectStudenGroupMap[assignedProject.projectId] = [];
      projectStudenGroupMap[assignedProject.projectId].push(
        assignedProject.studentId
      );
    });
    return NextResponse.json({
      message: "Success",
      data: projectStudenGroupMap,
    });

    // Create a map to store project details with assigned students
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
