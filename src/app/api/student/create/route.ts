import { NextRequest, NextResponse } from 'next/server';
import Student from '@/models/Student';
import Project from '@/models/Project';
import { dbConnect } from '@/lib/mongodb';
import { StudentI } from '@/types';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    let data = await req.json();   
    data = data.data;
    data = Object.setPrototypeOf(data, Array.prototype);
    
    // Fetch all projects
    const projects = await Project.find({});
    
    // Assign all projects to each student's preferences
    data = data.map((student: StudentI) => ({
      ...student,
      preferences: projects
    }));
    
    const students = await Student.insertMany(data);
    return NextResponse.json({ message: 'POST request received', students }, {status: 201});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}