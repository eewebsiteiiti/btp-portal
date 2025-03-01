import { NextRequest, NextResponse } from 'next/server';
import Professor from '@/models/Professor';
import { dbConnect } from '@/lib/mongodb';

interface Preference {
    [project: string]: string[][];
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        let data = await req.json();
        const professorEmail = data.email;

        console.log("Received students data:", data.students);

        const response = await Professor.findOneAndUpdate(
            { email: professorEmail },
            { $set: { students: JSON.stringify(data.students) } },
            { new: true }
        );

        return NextResponse.json({ message: 'Professor updated successfully', response }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error updating professor', error }, { status: 500 });
    }
}
