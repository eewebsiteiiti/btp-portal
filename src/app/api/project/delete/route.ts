import {  NextResponse } from "next/server";
import Project from "@/models/Project";
import { dbConnect } from "@/lib/mongodb";

export async function DELETE() {
  try {
    await dbConnect();
    const projects = await Project.deleteMany({});
    return NextResponse.json(
      { message: "DELETE request received", projects },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
