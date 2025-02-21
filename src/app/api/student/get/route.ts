import {  NextResponse ,NextRequest} from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  console.log(email);
  if (!email) {
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
  else {
  try {
    await dbConnect();
    const students = await Student.findOne({email});
    return NextResponse.json(
      { message: "GET request received", students },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
   } }
}
