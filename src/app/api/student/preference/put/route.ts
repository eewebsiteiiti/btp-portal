import { NextRequest, NextResponse } from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const filter = { email: data.email, name: data.name };
    const update = { preference: data.preference };
    console.log(filter, update);
    const students = await Student.findOneAndUpdate(filter, update);
    return NextResponse.json(
      { message: "PUT request received", students },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
