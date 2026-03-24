import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

interface StudentWithPrefs {
  id: string;
  rollNo: string;
  preferences: {
    id: string;
    projectId: string;
    orderIndex: number;
    isGroup: boolean;
    partnerRollNumber: string;
    status: string;
  }[];
}

interface ProjectData {
  id: string;
  capacity: number;
  dropProject: boolean;
}

interface ProfessorData {
  id: string;
  studentLimit: number;
  studentsPreference: Record<string, (string | { id: string })[][]>;
  projects: { id: string }[];
}

async function runMtpAllocationAlgorithm(domain: string): Promise<[string, string][]> {
  const professorData = await prisma.professor.findMany({
    include: { projects: { where: { program: "MTP", domain }, select: { id: true } } },
  });

  const students = await prisma.student.findMany({
    where: { program: "MTP", domain },
    include: {
      preferences: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  const projects = await prisma.project.findMany({
    where: { program: "MTP", domain },
  });

  // Filter professors to only those with MTP projects in this domain
  const relevantProfessors = professorData.filter((p) => p.projects.length > 0);

  const parsedProfessors: ProfessorData[] = relevantProfessors.map((prof) => ({
    id: prof.id,
    studentLimit: prof.studentLimit,
    studentsPreference: JSON.parse(prof.mtpStudentsPreference) as Record<string, string[][]>,
    projects: prof.projects,
  }));

  const projProfMap: Record<string, string> = {};
  for (const prof of parsedProfessors) {
    for (const project of prof.projects) {
      projProfMap[project.id] = prof.id;
    }
  }

  const profStudentCountMap: Record<string, number> = {};
  const limit: Record<string, number> = {};
  for (const prof of parsedProfessors) {
    profStudentCountMap[prof.id] = 0;
    limit[prof.id] = 4;
  }

  const studentIndexMap: Record<string, number> = {};
  students.forEach((student, i) => {
    studentIndexMap[student.id] = i;
  });

  const projectIndexMap: Record<string, number> = {};
  projects.forEach((project, i) => {
    projectIndexMap[project.id] = i;
  });

  const projectCapacity: Record<string, number> = {};
  const projectOff: Record<string, boolean> = {};
  projects.forEach((project) => {
    projectCapacity[project.id] = project.capacity;
    projectOff[project.id] = project.dropProject;
  });

  const studentMatrix: number[][] = students.map(() =>
    Array(projects.length).fill(1e5)
  );
  const professorMatrix: number[][] = students.map(() =>
    Array(projects.length).fill(1e5)
  );

  const projectGroupInfo: Record<string, Record<string, string>> = {};
  const studentPrefList: Record<string, (string | { id: string })[][]> = {};

  for (const prof of parsedProfessors) {
    for (const [projectId, prefList] of Object.entries(prof.studentsPreference)) {
      studentPrefList[projectId] = prefList;
    }
  }

  for (const [proj, listOfStudents] of Object.entries(studentPrefList)) {
    if (!Array.isArray(listOfStudents)) continue;
    for (const studs of listOfStudents) {
      if (studs.length > 1) {
        const temp1 = typeof studs[0] === "object" ? studs[0].id : studs[0].toString();
        const temp2 = typeof studs[1] === "object" ? studs[1].id : studs[1].toString();
        if (!projectGroupInfo[proj]) projectGroupInfo[proj] = {};
        projectGroupInfo[proj][temp1] = temp2;
        projectGroupInfo[proj][temp2] = temp1;
      }
    }
  }

  for (const st of students as StudentWithPrefs[]) {
    for (const pref of st.preferences) {
      const studentIdx = studentIndexMap[st.id];
      const projectIdx = projectIndexMap[pref.projectId];
      if (studentIdx !== undefined && projectIdx !== undefined) {
        studentMatrix[studentIdx][projectIdx] = pref.orderIndex;
      }
    }
  }

  for (const [proj, studs] of Object.entries(studentPrefList)) {
    if (!Array.isArray(studs)) continue;
    studs.forEach((studentGroup, prefIdx) => {
      for (const entry of studentGroup) {
        const studentId = typeof entry === "object" ? entry.id : entry.toString();
        const studentIdx = studentIndexMap[studentId];
        const projectIdx = projectIndexMap[proj];
        if (studentIdx !== undefined && projectIdx !== undefined) {
          professorMatrix[studentIdx][projectIdx] = prefIdx;
        }
      }
    });
  }

  let result = studentMatrix.map((row, i) =>
    row.map((val, j) => val + professorMatrix[i][j])
  );

  for (const [projectId, isDropped] of Object.entries(projectOff)) {
    if (isDropped) {
      const projectIdx = projectIndexMap[projectId];
      if (projectIdx !== undefined) {
        for (const row of result) {
          row[projectIdx] = 1e5;
        }
      }
    }
  }

  const finalMapping: [string, string][] = [];

  const checkRowFill = (matrix: number[][], i: number): boolean => {
    return matrix[i].every((val) => val === 1e5);
  };

  const fillProf = (
    profCount: Record<string, number>,
    matrix: number[][],
    limits: Record<string, number>,
    projProf: Record<string, string>
  ): void => {
    for (const [profId, count] of Object.entries(profCount)) {
      if (count >= limits[profId]) {
        const profProjects = Object.entries(projProf)
          .filter(([, pId]) => pId === profId)
          .map(([projectId]) => projectId);
        for (const projectId of profProjects) {
          const projectIdx = projectIndexMap[projectId];
          if (projectIdx !== undefined) {
            for (const row of matrix) {
              row[projectIdx] = 1e5;
            }
          }
        }
      }
    }
  };

  while (new Set(result.flat()).size !== 1) {
    const minVal = Math.min(...result.flat());
    if (minVal >= 1e5) break;

    const mask: [number, number][] = [];
    result.forEach((row, i) => {
      row.forEach((val, j) => {
        if (val === minVal) mask.push([i, j]);
      });
    });

    const rowSet = new Set<number>();
    const nonClashIndex: [number, number][] = [];
    const sameRowIndex: [number, number][] = [];

    for (const [i, j] of mask) {
      if (!rowSet.has(i)) {
        nonClashIndex.push([i, j]);
        rowSet.add(i);
      } else {
        sameRowIndex.push([i, j]);
      }
    }

    if (sameRowIndex.length > 0) {
      let preferredIndex: [number, number] = [-1, -1];
      let studentPref = 1e9;
      for (const [i, j] of sameRowIndex) {
        if (studentMatrix[i][j] < studentPref) {
          preferredIndex = [i, j];
          studentPref = studentMatrix[i][j];
        }
      }
      if (preferredIndex[0] !== -1) nonClashIndex.push(preferredIndex);
    }

    for (const [i, j] of nonClashIndex) {
      let studentId = "";
      let projectId = "";
      for (const [id, idx] of Object.entries(studentIndexMap)) {
        if (idx === i) studentId = id;
      }
      for (const [id, idx] of Object.entries(projectIndexMap)) {
        if (idx === j) projectId = id;
      }
      if (!studentId || !projectId) continue;

      let hasGroup = false;
      let partnerId = "";
      if (projectGroupInfo[projectId]?.[studentId]) {
        partnerId = projectGroupInfo[projectId][studentId];
        hasGroup = true;
      }

      const professorId = projProfMap[projectId];
      if (!professorId) continue;

      if (
        !hasGroup &&
        profStudentCountMap[professorId] < limit[professorId] &&
        !checkRowFill(result, i) &&
        projectCapacity[projectId] >= 1
      ) {
        finalMapping.push([studentId, projectId]);
        profStudentCountMap[professorId]++;
        result[i].fill(1e5);
        projectCapacity[projectId]--;
        if (projectCapacity[projectId] <= 0) {
          for (const row of result) row[j] = 1e5;
        }
        fillProf(profStudentCountMap, result, limit, projProfMap);
      } else if (
        hasGroup &&
        profStudentCountMap[professorId] <= limit[professorId] - 2 &&
        !checkRowFill(result, i) &&
        studentIndexMap[partnerId] !== undefined &&
        !checkRowFill(result, studentIndexMap[partnerId]) &&
        projectCapacity[projectId] >= 2
      ) {
        finalMapping.push([studentId, projectId]);
        finalMapping.push([partnerId, projectId]);
        profStudentCountMap[professorId] += 2;
        result[i].fill(1e5);
        result[studentIndexMap[partnerId]].fill(1e5);
        projectCapacity[projectId] -= 2;
        if (projectCapacity[projectId] <= 0) {
          for (const row of result) row[j] = 1e5;
        }
        fillProf(profStudentCountMap, result, limit, projProfMap);
      } else {
        for (const [mi, mj] of mask) {
          result[mi][mj] = 1e5;
        }
      }
    }
  }

  return finalMapping;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const allocations = await runMtpAllocationAlgorithm(domain);

    for (const [studentId, projectId] of allocations) {
      try {
        await prisma.assignedProject.create({
          data: { studentId, projectId },
        });
      } catch (err) {
        console.error("Error saving allocation:", err);
      }
    }

    return NextResponse.json(
      { message: "MTP Project Allotment successful for domain: " + domain, allocations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in MTP project allotment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error in project allotment", error: errorMessage },
      { status: 500 }
    );
  }
}
