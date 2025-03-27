import { NextResponse, NextRequest } from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json(); // [{ roll_no: number, TCPI: number }]

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid data format" },
        { status: 400 }
      );
    }

    // Update students concurrently using Promise.all
    await Promise.all(
      body.map(async (student) => {
        console.log(student.roll_no.toString());
        console.log(Number(student.TCPI));

        await Student.updateOne(
          { roll_no: student.roll_no.toString() },
          { $set: { cpi: Number(student.TCPI) } }
        );
      })
    );

    return NextResponse.json(
      { message: "Students updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error updating students", error },
      { status: 500 }
    );
  }
}
