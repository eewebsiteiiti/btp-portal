import { NextRequest, NextResponse } from "next/server";
import Project from "@/models/Project";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const projects = await Project.find({});
    const order: { [key: string]: Array<(typeof projects)[0]> } = {};
    for (let i = 0; i < projects.length; i++) {
      if (!order[projects[i].supervisor]) {
        order[projects[i].supervisor] = []; // Initialize the array if it doesn't exist
      }
      order[projects[i].supervisor].push(projects[i]); // Now you can safely push
    }

    return NextResponse.json(
      { message: "GET request received", order },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
