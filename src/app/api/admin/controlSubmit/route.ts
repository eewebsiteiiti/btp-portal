import { dbConnect } from "@/lib/mongodb";
import AssignedProjects from "@/models/AssignedProjects";
import Project from "@/models/Project";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import { ProjectAllotment, ProjectI, StudentDetails } from "@/types";

export async function POST() {
    try {
        await dbConnect();

        return NextResponse.json({
            message: "Success",
            // data: final_response,
        });

        // Create a map to store project details with assigned students
    } catch (error) {
        console.error("Error fetching assigned projects:", error);
        return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
}
