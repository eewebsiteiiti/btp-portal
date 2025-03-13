import { NextResponse } from "next/server";
import Professor from "@/models/Professor";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();

    const professors = await Professor.find({});
    const students = await Student.find({});

    for (const professor of professors) {
      for (const project of professor.projects) {
        const temp = [];
        for (const student of students) {
          temp.push([student._id]);
        }
        professor.studentsPreference.set(project, temp);
      }

      // Mark modified since it's a Map
      professor.markModified("studentsPreference");

      // Save the updated professor document
      await professor.save();
    }

    return NextResponse.json({
      message: "Success",
      data: professors, // Optional: return professors if needed
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error processing request", error: (error as Error).message },
      { status: 500 }
    );
  }
}
