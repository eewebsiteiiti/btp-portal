import { dbConnect } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Student from "@/models/Student";

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();

  const students = await Student.find();
  const check_student = await Student.findOne({ roll_no: data.roll_no });
  for (const student of students) {
    if (student.submitStatus === true) {
      // Check if the student has submitted the preferences
      for (const preference of student.preferences) {
        if (
          preference.isGroup === true &&
          preference.partnerRollNumber === check_student.roll_no
        ) {
          //found the project in common
          for (const check_preference of check_student.preferences) {
            // console.log(check_preference.project);
            if (
              check_preference.project.toString() ===
                preference.project.toString() &&
              check_preference.partnerRollNumber !== student.roll_no
            ) {
              return NextResponse.json({
                message: "Group Break",
                groupBreak: true,
              });
              // console.log("roll", check_preference.partnerRollNumber);
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ message: "Hello", groupBreak: false });
}
