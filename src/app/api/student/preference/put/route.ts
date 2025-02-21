import { NextRequest, NextResponse } from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    
    const data = await req.json();
    if (!data.email || !data.preference) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    const filter = { email: data.email };
    const update = { $set: { preferences: data.preference } }; // Update preference field
    const student = await Student.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Preferences updated successfully", student },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating student preferences:", error as Error);
    return NextResponse.json({ message: "Error updating preferences", error: error }, { status: 500 });
  }
}
