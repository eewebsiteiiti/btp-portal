import { NextResponse, NextRequest } from "next/server";
import Project from "@/models/Project";
import { dbConnect } from "@/lib/mongodb";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json(); // {id:bool}

    const projectUpdates = Object.entries(body).map(
      async ([projectId, drop]) => {
        await Project.updateOne(
          { _id: projectId },
          { $set: { dropProject: drop } }
        );
      }
    );
    // console.log(projectUpdates);

    await Promise.all(projectUpdates);

    return NextResponse.json(
      { message: "Projects updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error updating projects", error },
      { status: 500 }
    );
  }
}
