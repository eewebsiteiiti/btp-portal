// app/api/registration/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import {dbConnect} from '../../../lib/mongodb';
import User from '../../../models/User';

export async function POST(req: NextRequest) {
    try{
        await dbConnect();
        const reqBody = await req.json();
        // const reqBody = await req.body.json();
        console.log(reqBody);
        const newuser = new User(reqBody);
        console.log(newuser);
        await newuser.save();
        return NextResponse.json({ message: 'POST request received', newuser });
    }catch(e){
        console.log(e);
        
        return NextResponse.json({ message: 'Error', error: e }, { status: 500 });
    }
}

export async function GET() {
    await dbConnect();
    // return NextResponse.json({ message: 'GET request received' });
    const user = await User.find({}).lean();
    console.log(user);
    
    return NextResponse.json({ message: 'GET request received', user });
    
    // return NextResponse.json({ message: 'GET request received' });
}