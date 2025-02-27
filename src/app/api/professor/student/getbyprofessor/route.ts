import { NextRequest, NextResponse } from 'next/server';
import Professor from '@/models/Professor';
import { dbConnect } from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        // const { email } = await req.json();
        const email = 'professor1@university.com'
        const professor = await Professor.findOne({ email });
        const students = await Student.find();
        let projectWiseStudents: { [key: string]: { [key: number]: Set<string> } } = {};
        for (const project of professor.projects) {
            projectWiseStudents[project.toString()] = {};
            for (const student of students) {
                const preference = student.preferences;
                for (let i = 0; i < preference.length; i++) {
                    const prefer = preference[i];
                    let studentArray = [];
                    // console.log(student.roll_no);
                    studentArray.push(Number(student.roll_no));
                    if (prefer.isGroup && prefer.status === 'Success') {
                        studentArray.push(Number(prefer.partnerRollNumber));
                    }
                    studentArray.sort();
                    const setObject = JSON.stringify(studentArray);
                    // console.log(setObject)
                    const id = prefer.project.toString();
                    if (id in projectWiseStudents) {
                        if (!projectWiseStudents[id][i]) {
                            projectWiseStudents[id][i] = new Set<string>();
                            projectWiseStudents[id][i].add(setObject);
                        }
                        else {
                            projectWiseStudents[id][i].add(setObject);
                        }
                    }
                }
            }
            const test = (projectWiseStudents[project.toString()][0]);
            console.log(test);

            // for (const proj of professor.projects){
            //     const id = proj.toString();
            //     Object.keys(projectWiseStudents[id]).forEach((key) => {
            //         projectWiseStudents[id][key] = Array.from(projectWiseStudents[id][key]);
            //     }
            //     )
            // }

        }

        const data = Object.fromEntries(
            Object.entries(projectWiseStudents).map(([projectId, preferences]) => [
                projectId,
                Object.fromEntries(
                    Object.entries(preferences).map(([rank, studentSet]) => [
                        rank,
                        Array.from(studentSet), // Convert Set to Array
                    ])
                ),
            ])
        );
        console.log(projectWiseStudents);


        return NextResponse.json({ message: 'Professors added successfully', data }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error', error }, { status: 500 });
    }
}
