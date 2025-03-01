import { NextRequest, NextResponse } from "next/server";
import Professor from "@/models/Professor";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  console.log(email);
  if (email) {
    try {
      await dbConnect();
      const professor = await Professor.findOne({
        email,
      });
      return NextResponse.json(
        { message: "GET request received", professor },
        { status: 200 }
      );
    } catch (error) {
      console.log(error);
      return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
  } else {
    try {
      await dbConnect();
      const professors = await Professor.find({});
      return NextResponse.json(
        { message: "GET request received", professors },
        { status: 200 }
      );
    } catch (error) {
      console.log(error);
      return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
  }
}
