import {  NextResponse } from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();
    const students = await Student.find({});
    return NextResponse.json(
      { message: "GET request received", students },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
