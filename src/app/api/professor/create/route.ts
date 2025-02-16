import { NextRequest, NextResponse } from 'next/server';
import Professor from '@/models/Professor';
import { dbConnect } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    let data = await req.json();
    data = data.users;
    data = Object.setPrototypeOf(data, Array.prototype);
    const professors = await Professor.insertMany(data);
    return NextResponse.json({ message: 'POST request received', professors}, {status: 200});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}