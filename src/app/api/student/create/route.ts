import { NextRequest, NextResponse } from 'next/server';
import Student from '@/models/Student';
import { dbConnect } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    console.log(data);
    const students = await Student.insertMany(data);
    return NextResponse.json({ message: 'POST request received', students }, {status: 201});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}