import { NextRequest, NextResponse } from 'next/server';
import Professor from '@/models/Professor';
import { dbConnect } from '@/lib/mongodb';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    await dbConnect();
    const data = await req.json();
    console.log(data);
    const professor = await Professor.insertMany(data);
    return NextResponse.json({ message: 'POST request received', professor }, {status: 201});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}