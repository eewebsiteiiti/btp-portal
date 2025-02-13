// app/api/registration/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const data = await req.json();
    return NextResponse.json({ message: 'Data received', data });
}

export async function GET() {
    return NextResponse.json({ message: 'GET request received' });
}