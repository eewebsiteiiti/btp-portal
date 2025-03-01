import { NextResponse, NextRequest } from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";
const fun = () => {
    const project = Array.from({ length: 7 }, (_, i) => i + 1);

    const profProject: { [key: number]: number } = {
        0: 0,
        1: 0,
        2: 1,
        3: 1,
        4: 1,
        5: 2,
        6: 2,
    };

    const prof: { [key: number]: number } = {
        0: 0,
        1: 0,
        2: 0,
    };

    const limit: { [key: number]: number } = {
        0: 2,
        1: 2,
        2: 2,
    };

    const profStudentMap: { [key: number]: [number, number][] } = {
        0: [],
        1: [],
        2: [],
    };

    const student: number[][] = [
        [1, 2, 3, 4, 5, 6, 7],
        [4, 5, 6, 1, 2, 3, 7],
        [2, 1, 3, 4, 5, 6, 7],
        [4, 5, 3, 2, 1, 6, 7],
        [6, 7, 1, 2, 3, 4, 5],
    ];

    const professor: number[][] = [
        [1, 2, 4, 5, 4, 5, 1],
        [3, 3, 5, 1, 2, 1, 3],
        [2, 1, 2, 4, 4, 4, 4],
        [4, 4, 3, 2, 1, 3, 5],
        [5, 5, 1, 3, 3, 2, 2],
    ];

    const fillProf = (
        prof: { [key: number]: number },
        result: number[][],
        limit: { [key: number]: number },
        profProject: { [key: number]: number }
    ): number[][] => {
        Object.keys(prof).forEach((key) => {
            const profKey = parseInt(key);
            if (prof[profKey] === limit[profKey]) {
                const proj = Object.keys(profProject)
                    .map(Number)
                    .filter((k) => profProject[k] === profKey);
                proj.forEach((col) => {
                    result.forEach((row) => {
                        row[col] = 1e5;
                    });
                });
            }
        });
        return result;
    };

    let result = student.map((row, i) => row.map((val, j) => val + professor[i][j]));
    let finalMapping: [number, number][] = [];

    while (new Set(result.flat()).size !== 1) {
        const minVal = Math.min(...result.flat());
        const mask: [number, number][] = [];

        result.forEach((row, i) => {
            row.forEach((val, j) => {
                if (val === minVal) {
                    mask.push([i, j]);
                }
            });
        });

        const sameRowIndex: [number, number][] = [];
        const differentRowIndex: [number, number][] = [];
        const rowSet = new Set<number>();

        mask.forEach(([i, j]) => {
            if (!rowSet.has(i)) {
                differentRowIndex.push([i, j]);
                rowSet.add(i);
            } else {
                sameRowIndex.push([i, j]);
            }
        });

        if (sameRowIndex.length > 0) {
            let preferredIndex: [number, number] = [-1, -1];
            let studentPref = 1e9;

            sameRowIndex.forEach(([i, j]) => {
                if (student[i][j] < studentPref) {
                    preferredIndex = [i, j];
                    studentPref = student[i][j];
                }
            });
            differentRowIndex.push(preferredIndex);
        }

        const mapping: [number, number][] = [];
        differentRowIndex.forEach(([i, j]) => {
            const professorId = profProject[j];
            if (prof[professorId] < limit[professorId]) {
                mapping.push([i, j]);
                profStudentMap[professorId].push([i, j]);
                prof[professorId]++;
                console.log(prof);
                result = fillProf(prof, result, limit, profProject);
                result[i].fill(1e5);
                result.forEach((row) => (row[j] = 1e5));
            }
        });

        finalMapping = [...finalMapping, ...mapping];
    }

    console.log(finalMapping);
    console.log(profStudentMap);



}
export async function GET(req: NextRequest) {
    fun();
    NextResponse.json({ message: "GET request received" }, { status: 200 });
}
