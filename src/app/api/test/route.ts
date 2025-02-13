// app/api/registration/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try{
        const data = await req.json();

        return NextResponse.json({ message: 'Data received', data });

    }catch(e){
        return NextResponse.json({ message: 'Error', error: e });
    }
    
}

export async function GET() {
    return NextResponse.json({ message: 'GET request received' });
}