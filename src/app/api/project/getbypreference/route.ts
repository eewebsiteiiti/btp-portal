import { NextRequest, NextResponse } from "next/server";
import Project from "@/models/Project";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json(); 
    const { preferences } = data;

    if (!Array.isArray(preferences) || preferences.length === 0) {
      return NextResponse.json({ message: "Invalid preferences data" }, { status: 400 });
    }

    await dbConnect();
    const projectIds = preferences.map(pref => pref.project);
    const projects = await Project.find({ _id: { $in: projectIds } });
    
    const orderedProjects = preferences.map(pref => {
      const project = projects.find(p => p._id.toString() === pref.project);
      return project ? { 
        project, 
        isGroup: pref.isGroup || false, 
        partnerRollNumber: pref.partnerRollNumber || "", 
        status: pref.status || "Pending" 
      } : null;
    });
    
    return NextResponse.json({ projects: orderedProjects.filter(Boolean) });
  } catch (error) {
    console.error("Error fetching projects:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Error fetching projects", error: errorMessage }, { status: 500 });
  }
}