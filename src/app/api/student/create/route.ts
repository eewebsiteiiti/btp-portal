import { NextRequest, NextResponse } from 'next/server';
// import mongoose from 'mongoose';
import Student from '@/models/Student';
import Project from '@/models/Project';
import { dbConnect } from '@/lib/mongodb';
import { StudentI } from '@/types';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    let data = await req.json();   
    data = data.data;
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }
    
    // Fetch all projects
    const projects = await Project.find({}, '_id');
    
    // Assign all projects to each student's preferences in the required schema format
    const studentsData = data.map((student: StudentI) => ({
      roll_no: student.roll_no,
      name: student.name,
      email: student.email,
      password: student.password, // TODO: Hash password before saving
      preferences: projects.map(project => ({
        project: project._id,
        isGroup: false,
        partnerRollNumber: '',
        status: 'Pending'
      }))
    }));
    
    const students = await Student.insertMany(studentsData);
    return NextResponse.json({ message: 'Students added successfully', students }, { status: 201 });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error processing request', error: errorMessage }, { status: 500 });
  }
}