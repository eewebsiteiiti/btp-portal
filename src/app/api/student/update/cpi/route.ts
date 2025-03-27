import { NextResponse, NextRequest } from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json(); // {roll_no:number}
        console.log(body);
        const result = await Promise.all(
            Object.entries(body).map(async ([roll_no, cpi]) => {
                const result = await Student.updateOne(
                    { roll_no: roll_no.toString() },
                    { $set: { cpi: Number(cpi) } }
                );
                return result;
            })
        );

        await Promise.all(result);
        console.log(result);
        return NextResponse.json(
            { message: "Students updated successfully", result },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { message: "Error updating projects", error },
            { status: 500 }
        );
    }
}
