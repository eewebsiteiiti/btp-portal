import { NextResponse } from "next/server";
import Student from "@/models/Student";
import Professor from "@/models/Professor";
import Project from "@/models/Project";
import { dbConnect } from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();
    const students = await Student.countDocuments({});
    const professors = await Professor.countDocuments({});
    const projects = await Project.countDocuments({});
    const projectDetails = await Project.find({});
    let drops = 0;
    let nonDroppedCapacity = 0;
    projectDetails.map((p) => {
      if (p.dropProject === false) {
        drops += 1;
        nonDroppedCapacity += p.Capacity;
      }
    });
    const nonDroppedCounts = projects - drops;
    // count number of Dropped projects

    return NextResponse.json(
      {
        message: "GET count request received",
        students,
        professors,
        projects,
        drops,
        nonDroppedCounts,
        nonDroppedCapacity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
