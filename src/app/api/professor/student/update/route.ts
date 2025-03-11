import { NextRequest, NextResponse } from "next/server";
import { StudentI } from "@/types";
// import Professor from "@/models/Professor";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const studentsPreferenceResponse = data.students;
    // const professor_id = data.professor;
    const studentsPreferenceFormatted: { [key: string]: StudentI[][] } = {};
    for (const [projectId, students] of Object.entries(
      studentsPreferenceResponse
    )) {
      studentsPreferenceFormatted[projectId] = (
        students as { pref: number; studentGroup: StudentI[] }[]
      ).map(({ studentGroup }) => {
        return studentGroup;
      });
    }
    // const professorupdate = await Professor.findByIdAndUpdate(
    //   professor_id,
    //   { studentsPreference: studentsPreferenceFormatted },
    //   { new: true }
    // );
    // console.log(professorupdate);

    return NextResponse.json(
      { message: "This is a POST request" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating student preferences:", error as Error);
    return NextResponse.json(
      { message: "Error updating preferences", error },
      { status: 500 }
    );
  }
}
