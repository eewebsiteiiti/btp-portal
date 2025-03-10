import { dbConnect } from "@/lib/mongodb";
import { NextResponse, NextRequest } from "next/server";
import Professor from "@/models/Professor";
import Student from "@/models/Student";
import Project from "@/models/Project";
import { SSF } from "xlsx";
import { minify } from "next/dist/build/swc/generated-native";
const fun = async () => {
    try {
        await dbConnect();
        const professorData = await Professor.find({});
        // const projProfMap =
        const projProfMap: { [key: string]: string } = {};
        for (const prof of professorData) {
            for (const project of prof.projects) {
                projProfMap[project] = String(prof._id);
            }
        }
        const profStudentCountMap: { [key: string]: number } = {};
        for (const prof of professorData) {
            profStudentCountMap[prof._id] = 0;
        }
        // console.log(profStudentCountMap);

        const limit: { [key: string]: number } = {};
        for (const prof of professorData) {
            limit[prof._id] = prof.studentLimit;
        }
        // console.log(limit);

        const profStudentMap: { [string: string]: [number, number][] } = {};
        for (const prof of professorData) {
            profStudentMap[prof._id] = [];
        }

        const studentIndexMap: { [key: string]: number } = {};
        const students = await Student.find({});
        students.forEach((student, i) => {
            studentIndexMap[student._id] = i;
        });
        // console.log(studentIndexMap);
        const projectIndexMap: { [key: string]: number } = {};
        const projects = await Project.find({});
        projects.forEach((project, i) => {
            projectIndexMap[project._id] = i;
        });
        // 
        const student: number[][] = [];
        const professor: number[][] = [];

        // fill the student array with 1e4 dimension students x student preference array
        students.map((s) => {
            let a = []
            for (let i = 0; i < projects.length; i++) {
                a.push(1e5);
            }
            student.push(a)
        })

        // fill the professor array with 1e4 dimension professors x student preference array
        students.map((p) => {
            let a = []
            for (let i = 0; i < projects.length; i++) {
                a.push(1e5);
            }
            professor.push(a)
        }
        )

        const projectGroupInfo: { [key: string]: { [key: string]: string } } = {};


        // check grouping information
        const studentGroups: { [key: string]: string } = {};
        let studentPrefList: { [key: string]: any } = {};
        const projectWiseProfPref = professorData.map((p) => {
            p.studentsPreference.forEach((value, key) => {
                studentPrefList[key] = value;
            })
        });


        Object.keys(studentPrefList).map((proj) => {
            const listOfStudents = studentPrefList[proj];

            listOfStudents.map((studs) => {
                if (studs.length > 1) {
                    // console.log((studs[0].toString()));
                    // console.log((studs[1].toString()));
                    const temp1 = studs[0].toString();
                    const temp2 = studs[1].toString();
                    if (projectGroupInfo[proj] === undefined) {
                        projectGroupInfo[proj] = {};
                    }
                    projectGroupInfo[proj][temp1] = studs[1].toString();
                    projectGroupInfo[proj][temp2] = studs[0].toString();
                }
            })
        })

        // Fill student which is perference id corresponding to the project for each student
        students.forEach((st, i) => {
            const st_prefer = st.preferences;
            // console.log(st._id);
            const st_id = st._id.toString()
            st_prefer.forEach((p, p_idx) => {
                student[studentIndexMap[st_id]][projectIndexMap[p.project.toString()]] = p_idx;
            }
            )
        })


        // Fill professor which is perference id corresponding to the project for each professor


        Object.keys(studentPrefList).map((proj) => {
            const studs = studentPrefList[proj];
            studs.forEach((st, st_idx) => {
                if (st.length > 1) {
                    st.forEach((s, s_idx) => {
                        s = s.toString();
                        professor[studentIndexMap[s]][projectIndexMap[proj]] = st_idx;
                    })
                }
                else {
                    const st_od = st[0].toString();
                    professor[studentIndexMap[st_od]][projectIndexMap[proj]] = st_idx;
                }

            })
        })


        // //   const projProfMap: { [key: number]: number } = {
        // //     0: 0,
        // //     1: 0,
        // //     2: 1,
        // //     3: 1,
        // //     4: 1,
        // //     5: 2,
        // //     6: 2,
        // //   };

        // //   const profStudentCountMap: { [key: number]: number } = {
        // //     0: 0,
        // //     1: 0,
        // //     2: 0,
        // //   };

        // //   const limit: { [key: number]: number } = {
        // //     0: 2,
        // //     1: 2,
        // //     2: 2,
        // //   };

        // //   const profStudentMap: { [string: number]: [number, number][] } = {
        // //     0: [],
        // //     1: [],
        // //     2: [],
        // //   };

        // // TODO: REMOVE THE SECOND STUDENT FROM THE RESULT MATRIX

        // // const student: number[][] = [
        // //     [1, 2, 3, 4, 5, 6, 7],
        // //     [4, 5, 6, 1, 2, 3, 7],
        // //     [2, 1, 3, 4, 5, 6, 7],
        // //     [4, 5, 3, 2, 1, 6, 7],
        // //     [6, 7, 1, 2, 3, 4, 5],
        // // ];

        // // const professor: number[][] = [
        // //     [1, 2, 4, 5, 4, 5, 1],
        // //     [3, 3, 5, 1, 2, 1, 3],
        // //     [2, 1, 2, 4, 4, 4, 4],
        // //     [4, 4, 3, 2, 1, 3, 5],
        // //     [5, 5, 1, 3, 3, 2, 2],
        // // ];

        const fillProf = (
            prof: { [key: string]: number },
            result: number[][],
            limit: { [key: string]: number },
            projProfMap: { [key: string]: string }
        ): number[][] => {
            Object.keys(prof).forEach((key) => {
                if (prof[key] === limit[key]) {
                    const proj = Object.keys(projProfMap)
                        .filter((k) =>
                            projProfMap[k] === key
                        );
                    // console.log("heloooooooooooo", proj);
                    // proj.forEach((col) => {
                    //     result.forEach((row) => {
                    //         row[col] = 1e5;
                    //     });
                    // });

                    proj.forEach((project) => {
                        const j = projectIndexMap[project];
                        result.forEach((row) => {
                            row[j] = 1e5;
                        }
                        );
                    })
                    // console.log("heloooooooooooo", proj);
                    // console.log("professor", key, "is full");

                }
            });
            return result;
        };

        let result = student.map((row, i) =>
            row.map((val, j) => val + professor[i][j])
        );

        let finalMapping: [number, number][] = [];
        let minVal = 1e5 - 1;
        while (minVal < 1e5) {
            console.log(new Set(result.flat()));
            minVal = Math.min(...result.flat());
            const mask: [number, number][] = [];
            console.log(minVal);
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

            const mapping: [string, string][] = [];
            differentRowIndex.forEach(([i, j]) => {
                var studi_ob_id;
                Object.keys(studentIndexMap).map((key) => {
                    if (studentIndexMap[key] === i) {
                        studi_ob_id = key;
                    }
                })

                var proj_ob_id;
                Object.keys(projectIndexMap).map((key) => {
                    if (projectIndexMap[key] === j) {
                        proj_ob_id = key;
                    }
                })
                // console.log(projProfMap);

                const professorId = projProfMap[proj_ob_id]; // string of professor id
                // console.log("idhar aya:", profStudentCountMap[professorId]);
                // console.log("idhar aya1:", limit[professorId]);
                if (profStudentCountMap[professorId] < limit[professorId]) {
                    mapping.push([studi_ob_id, proj_ob_id]);
                    profStudentMap[professorId].push([studi_ob_id, proj_ob_id]);
                    profStudentCountMap[professorId]++;
                    // console.log("hello");
                    result = fillProf(profStudentCountMap, result, limit, projProfMap);
                    // console.log("idhar ", i, j);
                    result[i].fill(1e5);
                    result.forEach((row) => (row[j] = 1e5));
                }

            });
            finalMapping = [...finalMapping, ...mapping];
        }
        // return result;


        return profStudentCountMap;
        // console.log(profStudentMap);
    } catch (e) {
        console.log(e);
    }
}

export async function GET(req: NextRequest) {
    const dataaa = await fun();
    return NextResponse.json(
        { message: "GET request received", data: dataaa },
        { status: 200 }
    );
}
