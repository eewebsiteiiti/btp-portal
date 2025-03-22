import { NextResponse } from "next/server";
import Project from "@/models/Project";
import { dbConnect } from "@/lib/mongodb";

export async function PUT() {
    try {
        await dbConnect();
        // await Project.updateOne(
        //     { _id: '67d430ea275a92c306d13e0a' },
        //     { $set: { dropProject: true } }
        // );


        return NextResponse.json(
            { message: "PUT request received" },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
}
