import {  NextResponse } from "next/server";
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

    return NextResponse.json(
      { message: "GET count request received", students, professors, projects },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
