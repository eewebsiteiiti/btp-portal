import { NextRequest, NextResponse } from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    let data = await req.json();
    const name = data.name;
    let processed: { [key: string]:Set<Set<any>> } = {};
    const students = await Student.find({});
    for (let i = 0; i < students.length; i++) {
      const preference = students[i].preference;
      for (let j = 0; j < preference.length; j++) {
        if (preference[j].project.supervisor === name) {
          const pref_index = j;
          const key = preference[j].project.title;
          const group = preference[j].group;
          // group
          const student_list = new Set();
          student_list.add(students[i]);
          // check for group
          if (group.isGroup) {
            const student2 = students.find(
              (student) => student.roll_no === group.roll_no
            );
            student_list.add(student2);
          }
          if (!processed[key]) {
            processed[key] = new Set();
            processed[key].add(student_list);
          } else {
            processed[key].add(student_list);
          }
        }
      }
    }
    console.log(processed);
    return NextResponse.json(
      { message: "POST request received", processed },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
