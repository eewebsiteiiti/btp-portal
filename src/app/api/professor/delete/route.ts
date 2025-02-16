import { NextRequest, NextResponse } from "next/server";
import Professor from "@/models/Professor";
import { dbConnect } from "@/lib/mongodb";

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const professors = await Professor.deleteMany({});
    return NextResponse.json(
      { message: "DELETE request received", professors },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
