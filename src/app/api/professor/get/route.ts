import { NextRequest, NextResponse } from "next/server";
import Professor from "@/models/Professor";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
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
