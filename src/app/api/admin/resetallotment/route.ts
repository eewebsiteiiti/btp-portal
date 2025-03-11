import { dbConnect } from "@/lib/mongodb";
import AssignedProjects from "@/models/AssignedProjects";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    await AssignedProjects.deleteMany({});
    return NextResponse.json({ message: "Successfull Reset" }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
