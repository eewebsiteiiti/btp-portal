import { dbConnect } from "@/lib/mongodb";
import { NextResponse, NextRequest } from "next/server";
import Professor from "@/models/Professor";
import Student from "@/models/Student";
import Project from "@/models/Project";
const fun = async () => {
  try {
    await dbConnect();
    const professorData = await Professor.find({});
    // console.log(professorData);
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
    const fn = () => {};
    // console.log(projProfMap);

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
    // console.log(projectIndexMap);

    const student: number[][] = [];
    const professor: number[][] = [];

    // console.log(professorData);
    // console.log(students[0].preferences);

    console.log(studentGroups);
  } catch (e) {
    console.log(e);
  }

  //   const projProfMap: { [key: number]: number } = {
  //     0: 0,
  //     1: 0,
  //     2: 1,
  //     3: 1,
  //     4: 1,
  //     5: 2,
  //     6: 2,
  //   };

  //   const profStudentCountMap: { [key: number]: number } = {
  //     0: 0,
  //     1: 0,
  //     2: 0,
  //   };

  //   const limit: { [key: number]: number } = {
  //     0: 2,
  //     1: 2,
  //     2: 2,
  //   };

  //   const profStudentMap: { [string: number]: [number, number][] } = {
  //     0: [],
  //     1: [],
  //     2: [],
  //   };

  // TODO: REMOVE THE SECOND STUDENT FROM THE RESULT MATRIX

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
    prof: { [key: string]: number },
    result: number[][],
    limit: { [key: string]: number },
    projProfMap: { [key: string]: string }
  ): number[][] => {
    Object.keys(prof).forEach((key) => {
      if (prof[key] === limit[key]) {
        const proj = Object.keys(projProfMap)
          .map(Number)
          .filter((k) => projProfMap[k] === key);
        proj.forEach((col) => {
          result.forEach((row) => {
            row[col] = 1e5;
          });
        });
      }
    });
    return result;
  };

  let result = student.map((row, i) =>
    row.map((val, j) => val + professor[i][j])
  );
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
      const professorId = projProfMap[j];
      if (profStudentCountMap[professorId] < limit[professorId]) {
        mapping.push([i, j]);
        profStudentMap[professorId].push([i, j]);
        profStudentCountMap[professorId]++;
        console.log(profStudentCountMap);
        result = fillProf(profStudentCountMap, result, limit, projProfMap);
        result[i].fill(1e5);
        result.forEach((row) => (row[j] = 1e5));
      }
    });

    finalMapping = [...finalMapping, ...mapping];
  }

  console.log(finalMapping);
  console.log(profStudentMap);
};
export async function GET(req: NextRequest) {
  fun();
  return NextResponse.json(
    { message: "GET request received" },
    { status: 200 }
  );
}
