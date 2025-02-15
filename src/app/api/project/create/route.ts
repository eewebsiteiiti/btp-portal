import { NextRequest, NextResponse } from 'next/server';
import Project from '@/models/Project';
import { dbConnect } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    console.log(data);
    const projects = await Project.insertMany(data);
    return NextResponse.json({ message: 'POST request received', projects }, {status: 201});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}