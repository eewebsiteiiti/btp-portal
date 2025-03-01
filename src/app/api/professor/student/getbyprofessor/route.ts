import { NextRequest, NextResponse } from "next/server";
import Professor from "@/models/Professor";
import { dbConnect } from "@/lib/mongodb";
import Student from "@/models/Student";
import Project from "@/models/Project";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();
    const professor = await Professor.findOne({ email });

    if (!professor) {
      return NextResponse.json(
        { message: "Professor not found" },
        { status: 404 }
      );
    }

    const students = await Student.find();
    const projectWiseStudents: {
      [key: string]: { [key: number]: Set<string> };
    } = {};
    const projectDetails = await Project.find({
      _id: { $in: professor.projects },
    });

    for (const project of professor.projects) {
      projectWiseStudents[project.toString()] = {};

      for (const student of students) {
        const preference = student.preferences;

        for (let i = 0; i < preference.length; i++) {
          const prefer = preference[i];

          if (prefer.project.toString() === project.toString()) {
            const studentGroup = [student];

            if (prefer.isGroup && prefer.status === "Success") {
              const partner = students.find(
                (s) => s.roll_no === prefer.partnerRollNumber
              );
              if (partner) studentGroup.push(partner);
            }

            studentGroup.sort((a, b) => Number(a.roll_no) - Number(b.roll_no)); // Sort for consistency
            const setObject = JSON.stringify(
              studentGroup.map((s) => s.toObject())
            ); // Store full student objects

            if (!projectWiseStudents[project.toString()][i]) {
              projectWiseStudents[project.toString()][i] = new Set<string>();
            }
            projectWiseStudents[project.toString()][i].add(setObject);
          }
        }
      }
    }

    const data = Object.fromEntries(
      Object.entries(projectWiseStudents).map(([projectId, preferences]) => [
        projectId,
        Object.fromEntries(
          Object.entries(preferences).map(([rank, studentSet]) => [
            rank,
            Array.from(studentSet).map((str) => JSON.parse(str)), // Convert Set to Array of student objects
          ])
        ),
      ])
    );

    return NextResponse.json(
      { message: "Data retrieved successfully", data, projectDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
