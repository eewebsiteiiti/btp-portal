import { NextRequest, NextResponse } from "next/server";
import Professor from "@/models/Professor";
import { dbConnect } from "@/lib/mongodb";
import Project from "@/models/Project";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    let data = await req.json();
    data = data.data;
    data = Object.setPrototypeOf(data, Array.prototype);

    // Fetch projects for each professor and add them to the data
    for (const professor of data) {
      const projects = await Project.find({
        Supervisor_email: professor.email,
      });
      professor.projects = projects; // Adding projects to professor object
    }

    // Insert updated professor data
    const professors = await Professor.insertMany(data);

    return NextResponse.json(
      { message: "Professors added successfully", professors },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
