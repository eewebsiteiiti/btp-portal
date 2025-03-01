"use client";
import { useState, useEffect } from 'react';
import { NextPage } from 'next';

const ProjectAllocation: NextPage = () => {
    // State variables
    const [project, setProject] = useState<number[]>([]);
    const [profProject, setProfProject] = useState<Record<number, number>>({});
    const [prof, setProf] = useState<Record<number, number>>({});
    const [limit, setLimit] = useState<Record<number, number>>({});
    const [profStudentMap, setProfStudentMap] = useState<Record<number, number[][]>>({});
    const [student, setStudent] = useState<number[][]>([]);
    const [professor, setProfessor] = useState<number[][]>([]);
    const [result, setResult] = useState<number[][]>([]);
    const [finalMapping, setFinalMapping] = useState<[number, number][]>([]);

    useEffect(() => {
        // Initialize data
        setProject(Array.from({ length: 7 }, (_, i) => i + 1));
        setProfProject({
            0: 0, 1: 0, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2
        });
        setProf({ 0: 0, 1: 0, 2: 0 });
        setLimit({ 0: 2, 1: 2, 2: 2 });
        setProfStudentMap({ 0: [], 1: [], 2: [] });
        setStudent([
            [1, 2, 3, 4, 5, 6, 7],
            [4, 5, 6, 1, 2, 3, 7],
            [2, 1, 3, 4, 5, 6, 7],
            [4, 5, 3, 2, 1, 6, 7],
            [6, 7, 1, 2, 3, 4, 5]
        ]);
        setProfessor([
            [1, 2, 4, 5, 4, 5, 1],
            [3, 3, 5, 1, 2, 1, 3],
            [2, 1, 2, 4, 4, 4, 4],
            [4, 4, 3, 2, 1, 3, 5],
            [5, 5, 1, 3, 3, 2, 2]
        ]);
    }, []);

    useEffect(() => {
        if (student.length > 0 && professor.length > 0) {
            setResult(student.map((row, i) => row.map((val, j) => val + professor[i][j])));
        }
    }, [student, professor]);

    const fillProf = (
        prof: Record<number, number>,
        professor: number[][],
        result: number[][],
        limit: Record<number, number>,
        profProject: Record<number, number>
    ): number[][] => {
        Object.keys(prof).forEach((key) => {
            const numKey = Number(key);
            if (prof[numKey] === limit[numKey]) {
                const proj = Object.keys(profProject)
                    .filter(k => profProject[Number(k)] === numKey)
                    .map(Number);

                proj.forEach(col => {
                    result = result.map(row => row.map((val, index) => index === col ? 1e5 : val));
                });
            }
        });
        return result;
    };


    useEffect(() => {
        const allocateProjects = () => {
            let tempResult = [...result];
            let tempFinalMapping: [number, number][] = [];

            while (new Set(tempResult.flat()).size !== 1) {
                const minValue = Math.min(...tempResult.flat());
                const mask = tempResult.map(row => row.map(val => val === minValue));
                const index = mask.flatMap((row, i) => row.map((val, j) => val ? [i, j] : null)).filter((val): val is [number, number] => val !== null);

                const sameRowIndex: [number, number][] = [];
                const differentRowIndex: [number, number][] = [];
                const row: number[] = [];

                index.forEach(idx => {
                    if (!row.includes(idx[0])) {
                        differentRowIndex.push(idx);
                        row.push(idx[0]);
                    } else {
                        sameRowIndex.push(idx);
                    }
                });

                let studentPrefI = 1e5;
                let studentPrefJ = 1e5;
                let studentPref = 1e5;

                sameRowIndex.forEach(i => {
                    if (student[i[0]][i[1]] < studentPref) {
                        studentPrefI = i[0];
                        studentPrefJ = i[1];
                        studentPref = student[i[0]][i[1]];
                    }
                });

                if (sameRowIndex.length !== 0) {
                    differentRowIndex.push([studentPrefI, studentPrefJ]);
                }

                differentRowIndex.forEach(i => {
                    const proff = profProject[i[1]];
                    if (prof[proff] < limit[proff]) {
                        tempFinalMapping.push(i);
                        profStudentMap[proff].push(i);
                        prof[proff]++;
                        tempResult = fillProf(prof, professor, tempResult, limit, profProject);
                    }
                    tempResult[i[0]] = new Array(tempResult[i[0]].length).fill(1e5);
                    tempResult = tempResult.map(row => row.map((val, idx) => idx === i[1] ? 1e5 : val));
                    console.log(tempResult);
                });
            }

            setFinalMapping(tempFinalMapping);
        };

        if (result.length > 0) {
            allocateProjects();
        }
    }, [result, student, professor, prof, limit, profProject, profStudentMap]);

    return (
        <div>
            <h1>Project Allocation Result</h1>
            <pre>{JSON.stringify(finalMapping, null, 2)}</pre>
        </div>
    );
};

export default ProjectAllocation;
