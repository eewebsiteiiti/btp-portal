import {  NextRequest, NextResponse } from "next/server";
import Project from "@/models/Project";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    const data = await req.json(); 
const preferences = data.preferences;
    
    

  try {
    await dbConnect();
    const projects = await Project.find({ _id: { $in: preferences } });
    const orderedProjects = preferences.map((id: string) => projects.find(project => project._id.toString() === id));
    return NextResponse.json({ projects: orderedProjects });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
