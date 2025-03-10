import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Professor from "@/models/Professor";
import Student from "@/models/Student";
import Project from "@/models/Project";
import AssignedProjects from "@/models/AssignedProjects";
const fun = async () => {
  try {
    await dbConnect();
    const professorData = await Professor.find({});
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

    const limit: { [key: string]: number } = {};
    for (const prof of professorData) {
      // limit[prof._id] = prof.studentLimit;
      limit[prof._id] = 4;
    }

    const profStudentMap: { [string: string]: [string, string][] } = {};
    for (const prof of professorData) {
      profStudentMap[prof._id] = [];
    }

    const studentIndexMap: { [key: string]: number } = {};
    const students = await Student.find({});
    students.forEach((student, i) => {
      studentIndexMap[student._id] = i;
    });

    const projectIndexMap: { [key: string]: number } = {};
    const projects = await Project.find({});
    projects.forEach((project, i) => {
      projectIndexMap[project._id] = i;
    });

    const projectCapacity: { [key: string]: number } = {};
    projects.forEach((project) => {
      projectCapacity[project._id] = project.capacity;
    });

    const student: number[][] = [];
    const professor: number[][] = [];

    // fill the student array with 1e4 dimension students x student preference array
    students.map(() => {
      const a = [];
      for (let i = 0; i < projects.length; i++) {
        a.push(1e5);
      }
      student.push(a);
    });

    // fill the professor array with 1e4 dimension professors x student preference array
    students.map(() => {
      const a = [];
      for (let i = 0; i < projects.length; i++) {
        a.push(1e5);
      }
      professor.push(a);
    });

    const projectGroupInfo: { [key: string]: { [key: string]: string } } = {};

    // check grouping information
    // const studentGroups: { [key: string]: string } = {};
    const studentPrefList: { [key: string]: { [key: string]: string[] } } = {};
    professorData.forEach((p) => {
      p.studentsPreference.forEach(
        (value: { [key: string]: string[] }, key: string | number) => {
          studentPrefList[key] = value;
        }
      );
    });

    Object.keys(studentPrefList).map((proj) => {
      const listOfStudents = studentPrefList[proj];

      Object.values(listOfStudents).map((studs: string[]) => {
        if (studs.length > 1) {
          const temp1 = studs[0].toString();
          const temp2 = studs[1].toString();
          if (projectGroupInfo[proj] === undefined) {
            projectGroupInfo[proj] = {};
          }
          projectGroupInfo[proj][temp1] = studs[1].toString();
          projectGroupInfo[proj][temp2] = studs[0].toString();
        }
      });
    });

    // Fill student which is perference id corresponding to the project for each student
    students.forEach((st) => {
      const st_prefer = st.preferences;
      const st_id = st._id.toString();
      st_prefer.forEach(
        (
          p: { project: { toString: () => string | number } },
          p_idx: number
        ) => {
          student[studentIndexMap[st_id]][
            projectIndexMap[p.project.toString()]
          ] = p_idx;
        }
      );
    });

    // Fill professor which is perference id corresponding to the project for each professor
    Object.keys(studentPrefList).map((proj) => {
      const studs = studentPrefList[proj];
      Object.values(studs).forEach((st: string[], st_idx: number) => {
        if (st.length > 1) {
          st.forEach((s) => {
            s = s.toString();
            professor[studentIndexMap[s]][projectIndexMap[proj]] = st_idx;
          });
        } else {
          const st_od = st[0].toString();
          professor[studentIndexMap[st_od]][projectIndexMap[proj]] = st_idx;
        }
      });
    });

    const fillProf = (
      prof: { [key: string]: number },
      result: number[][],
      limit: { [key: string]: number },
      projProfMap: { [key: string]: string }
    ): number[][] => {
      Object.keys(prof).forEach((key) => {
        if (prof[key] === limit[key]) {
          const proj = Object.keys(projProfMap).filter(
            (k) => projProfMap[k] === key
          );

          proj.forEach((project) => {
            const j = projectIndexMap[project];
            result.forEach((row) => {
              row[j] = 1e5;
            });
          });
        }
      });
      return result;
    };

    const checkRowFill = (result: number[][], i: number): boolean => {
      let count = 0;
      result[i].forEach((val) => {
        if (val === 1e5) {
          count++;
        }
      });
      return count === result[i].length;
    };

    let result = student.map((row, i) =>
      row.map((val, j) => val + professor[i][j])
    );

    let finalMapping: ([number, number] | [string, string])[] = [];
    let minVal = 1e5 - 1;
    while (new Set(result.flat()).size !== 1) {
      minVal = Math.min(...result.flat());
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
      const mapping: [string, string][] = [];
      let studi_ob_id: string;
      let proj_ob_id: string;
      differentRowIndex.forEach(([i, j]) => {
        Object.keys(studentIndexMap).map((key) => {
          if (studentIndexMap[key] === i) {
            studi_ob_id = key;
          }
        });

        Object.keys(projectIndexMap).map((key) => {
          if (projectIndexMap[key] === j) {
            proj_ob_id = key;
          }
        });

        // does the student have a group?
        let checkGroup = false;
        let partner = "";
        if (projectGroupInfo[proj_ob_id] === undefined) {
          checkGroup = false;
        } else {
          partner = projectGroupInfo[proj_ob_id][studi_ob_id];
          if (partner !== undefined) {
            checkGroup = true;
          }
        }

        const professorId = projProfMap[proj_ob_id];
        if (
          profStudentCountMap[professorId] <= limit[professorId] &&
          !checkGroup &&
          !checkRowFill(result, i)
        ) {
          mapping.push([studi_ob_id, proj_ob_id]);
          profStudentMap[professorId].push([studi_ob_id, proj_ob_id]);
          profStudentCountMap[professorId]++;
          result = fillProf(profStudentCountMap, result, limit, projProfMap);
          result[i].fill(1e5);
          projectCapacity[proj_ob_id]--;
          if (projectCapacity[proj_ob_id] <= 0) {
            result.forEach((row) => (row[j] = 1e5));
          }
        } else if (
          profStudentCountMap[professorId] <= limit[professorId] - 2 &&
          checkGroup &&
          !checkRowFill(result, i)
        ) {
          mapping.push([studi_ob_id, proj_ob_id]);
          mapping.push([partner, proj_ob_id]);
          profStudentMap[professorId].push([studi_ob_id, proj_ob_id]);
          profStudentMap[professorId].push([partner, proj_ob_id]);
          profStudentCountMap[professorId] += 2;
          result = fillProf(profStudentCountMap, result, limit, projProfMap);
          result[i].fill(1e5);
          const partnerIndex = studentIndexMap[partner];
          result[partnerIndex].fill(1e5);
          projectCapacity[proj_ob_id] -= 2;
          result.forEach((row) => (row[j] = 1e5));
        }
      });
      finalMapping = [...finalMapping, ...mapping];
    }

    return finalMapping;
  } catch (e) {
    console.log(e);
  }
};

export async function GET() {
  try {
    const data = await fun();

    data?.map(async (d) => {
      try {
        const assignedProjects = new AssignedProjects({
          studentId: d[0],
          projectId: d[1],
        });

        await assignedProjects.save();
      } catch (e) {
        console.log(e);
        NextResponse.json({ message: "Error", e }, { status: 500 });
      }
    });

    return NextResponse.json(
      { message: "GET request received" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
