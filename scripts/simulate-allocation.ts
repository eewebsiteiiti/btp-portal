/**
 * BTP Allocation Simulation Script
 *
 * This script simulates the entire BTP allocation process:
 * 1. Generates random student preferences
 * 2. Generates random professor preferences
 * 3. Runs the allocation algorithm
 * 4. Shows results and statistics
 *
 * Usage: npm run simulate [--dry-run] [--reset]
 *
 * Options:
 *   --dry-run   Don't save to database, just show what would happen
 *   --reset     Clear existing preferences before simulation
 */

import { PrismaClient } from "@prisma/client";
import { config as dotenvConfig } from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenvConfig({ path: path.resolve(process.cwd(), ".env") });

// Override DATABASE_URL to use absolute path
const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

interface SimulationConfig {
  dryRun: boolean;
  reset: boolean;
  minPreferences: number;
  maxPreferences: number;
  groupProbability: number; // Probability a student wants to do group project
}

const config: SimulationConfig = {
  dryRun: process.argv.includes("--dry-run"),
  reset: process.argv.includes("--reset"),
  minPreferences: 999, // All projects (will be capped to actual count)
  maxPreferences: 999,
  groupProbability: 0.3, // 30% chance of group preference
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function clearExistingData() {
  console.log("🗑️  Clearing existing preferences and allocations...");

  await prisma.assignedProject.deleteMany({});
  await prisma.preference.deleteMany({});
  await prisma.student.updateMany({
    data: { submitStatus: false },
  });
  await prisma.professor.updateMany({
    data: { studentsPreference: "{}", submitStatus: false },
  });

  console.log("✅ Cleared all preferences and allocations\n");
}

async function generateStudentPreferences() {
  console.log("📝 Generating student preferences...\n");

  const students = await prisma.student.findMany();
  const projects = await prisma.project.findMany({
    where: { dropProject: false },
  });

  const studentRollNos = students.map(s => s.rollNo);
  let groupCount = 0;
  let soloCount = 0;

  for (const student of students) {
    // Shuffle all projects - students must rank all projects
    const shuffledProjects = shuffleArray(projects);
    const selectedProjects = shuffledProjects; // All projects must be ranked

    // Decide if student wants group projects
    const wantsGroup = Math.random() < config.groupProbability;
    const potentialPartners = studentRollNos.filter(r => r !== student.rollNo);
    const partner = wantsGroup && potentialPartners.length > 0
      ? potentialPartners[Math.floor(Math.random() * potentialPartners.length)]
      : null;

    if (!config.dryRun) {
      // Clear existing preferences for this student
      await prisma.preference.deleteMany({
        where: { studentId: student.id },
      });

      // Create new preferences
      for (let i = 0; i < selectedProjects.length; i++) {
        const project = selectedProjects[i];
        const isGroup = partner !== null && Math.random() < 0.5; // 50% of their prefs are group

        await prisma.preference.create({
          data: {
            studentId: student.id,
            projectId: project.id,
            orderIndex: i,
            isGroup,
            partnerRollNumber: isGroup ? partner : "",
            status: "Pending",
          },
        });

        if (isGroup) groupCount++;
        else soloCount++;
      }

      // Mark student as submitted
      await prisma.student.update({
        where: { id: student.id },
        data: { submitStatus: true },
      });
    }
  }

  console.log(`   Generated preferences for ${students.length} students`);
  console.log(`   Solo preferences: ${soloCount}`);
  console.log(`   Group preferences: ${groupCount}\n`);
}

async function generateProfessorPreferences() {
  console.log("👨‍🏫 Generating professor preferences...\n");

  const professors = await prisma.professor.findMany({
    include: { projects: true },
  });
  const students = await prisma.student.findMany();

  for (const professor of professors) {
    const studentsPreference: Record<string, string[][]> = {};

    for (const project of professor.projects) {
      // Get students who preferred this project
      const prefsForProject = await prisma.preference.findMany({
        where: { projectId: project.id },
        include: { student: true },
      });

      // Shuffle and create ranked list
      const shuffledPrefs = shuffleArray(prefsForProject);
      const rankedStudents: string[][] = [];

      const addedStudents = new Set<string>();
      for (const pref of shuffledPrefs) {
        // Skip if already added (avoid duplicates from group pairs)
        if (addedStudents.has(pref.student.id)) continue;

        if (pref.isGroup && pref.partnerRollNumber) {
          // Find partner's student ID
          const partner = students.find(s => s.rollNo === pref.partnerRollNumber);
          if (partner && !addedStudents.has(partner.id)) {
            rankedStudents.push([pref.student.id, partner.id]);
            addedStudents.add(pref.student.id);
            addedStudents.add(partner.id);
          } else {
            // Partner not found or already added, add as solo
            rankedStudents.push([pref.student.id]);
            addedStudents.add(pref.student.id);
          }
        } else {
          rankedStudents.push([pref.student.id]);
          addedStudents.add(pref.student.id);
        }
      }

      if (rankedStudents.length > 0) {
        studentsPreference[project.id] = rankedStudents;
      }
    }

    if (!config.dryRun) {
      await prisma.professor.update({
        where: { id: professor.id },
        data: {
          studentsPreference: JSON.stringify(studentsPreference),
          submitStatus: true,
        },
      });
    }

    const totalRanked = Object.values(studentsPreference).reduce(
      (sum, arr) => sum + arr.length, 0
    );
    console.log(`   ${professor.name}: ranked ${totalRanked} students across ${professor.projects.length} projects`);
  }
  console.log("");
}

async function runAllocation(): Promise<[string, string][]> {
  console.log("🎯 Running allocation algorithm...\n");

  // Fetch all data
  const professorData = await prisma.professor.findMany({
    include: { projects: { select: { id: true } } },
  });

  const students = await prisma.student.findMany({
    include: {
      preferences: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  const projects = await prisma.project.findMany();

  interface ProfessorData {
    id: string;
    studentLimit: number;
    studentsPreference: Record<string, string[][]>;
    projects: { id: string }[];
  }

  // Parse professor preferences and build maps
  const parsedProfessors: ProfessorData[] = professorData.map((prof) => ({
    id: prof.id,
    studentLimit: prof.studentLimit,
    studentsPreference: JSON.parse(prof.studentsPreference) as Record<string, string[][]>,
    projects: prof.projects,
  }));

  // Build project -> professor map
  const projProfMap: Record<string, string> = {};
  for (const prof of parsedProfessors) {
    for (const project of prof.projects) {
      projProfMap[project.id] = prof.id;
    }
  }

  // Professor student count tracking
  const profStudentCountMap: Record<string, number> = {};
  const limit: Record<string, number> = {};
  for (const prof of parsedProfessors) {
    profStudentCountMap[prof.id] = 0;
    // Use professor's studentLimit from database, or sum of project capacities (whichever is higher)
    const projectCapacitySum = prof.projects.reduce((sum, p) => {
      const proj = projects.find(pr => pr.id === p.id);
      return sum + (proj?.capacity || 0);
    }, 0);
    limit[prof.id] = Math.max(prof.studentLimit, projectCapacitySum);
  }

  // Student and project index maps
  const studentIndexMap: Record<string, number> = {};
  students.forEach((student, i) => {
    studentIndexMap[student.id] = i;
  });

  const projectIndexMap: Record<string, number> = {};
  projects.forEach((project, i) => {
    projectIndexMap[project.id] = i;
  });

  // Project capacity and drop status
  const projectCapacity: Record<string, number> = {};
  const projectOff: Record<string, boolean> = {};
  projects.forEach((project) => {
    projectCapacity[project.id] = project.capacity;
    projectOff[project.id] = project.dropProject;
  });

  // Initialize matrices
  const studentMatrix: number[][] = students.map(() =>
    Array(projects.length).fill(1e5)
  );
  const professorMatrix: number[][] = students.map(() =>
    Array(projects.length).fill(1e5)
  );

  // Build student preference list from professors
  const studentPrefList: Record<string, string[][]> = {};
  for (const prof of parsedProfessors) {
    for (const [projectId, prefList] of Object.entries(prof.studentsPreference)) {
      studentPrefList[projectId] = prefList;
    }
  }

  // Extract group information
  const projectGroupInfo: Record<string, Record<string, string>> = {};
  for (const [proj, listOfStudents] of Object.entries(studentPrefList)) {
    if (!Array.isArray(listOfStudents)) continue;
    for (const studs of listOfStudents) {
      if (studs.length > 1) {
        const temp1 = studs[0].toString();
        const temp2 = studs[1].toString();
        if (!projectGroupInfo[proj]) projectGroupInfo[proj] = {};
        projectGroupInfo[proj][temp1] = temp2;
        projectGroupInfo[proj][temp2] = temp1;
      }
    }
  }

  // Fill student matrix
  for (const st of students) {
    for (const pref of st.preferences) {
      const studentIdx = studentIndexMap[st.id];
      const projectIdx = projectIndexMap[pref.projectId];
      if (studentIdx !== undefined && projectIdx !== undefined) {
        studentMatrix[studentIdx][projectIdx] = pref.orderIndex;
      }
    }
  }

  // Fill professor matrix
  for (const [proj, studs] of Object.entries(studentPrefList)) {
    if (!Array.isArray(studs)) continue;
    studs.forEach((studentGroup, prefIdx) => {
      for (const studentId of studentGroup) {
        const studentIdx = studentIndexMap[studentId.toString()];
        const projectIdx = projectIndexMap[proj];
        if (studentIdx !== undefined && projectIdx !== undefined) {
          professorMatrix[studentIdx][projectIdx] = prefIdx;
        }
      }
    });
  }

  // Combined result matrix
  let result = studentMatrix.map((row, i) =>
    row.map((val, j) => val + professorMatrix[i][j])
  );

  // Mark dropped projects
  for (const [projectId, isDropped] of Object.entries(projectOff)) {
    if (isDropped) {
      const projectIdx = projectIndexMap[projectId];
      if (projectIdx !== undefined) {
        for (const row of result) row[projectIdx] = 1e5;
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
            for (const row of matrix) row[projectIdx] = 1e5;
          }
        }
      }
    }
  };

  // Main allocation loop
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
        for (const [mi, mj] of mask) result[mi][mj] = 1e5;
      }
    }
  }

  // Save to database
  for (const [studentId, projectId] of finalMapping) {
    try {
      await prisma.assignedProject.create({
        data: { studentId, projectId },
      });
    } catch (err) {
      // Skip duplicates
    }
  }

  return finalMapping;
}

async function showResults() {
  console.log("📊 ALLOCATION RESULTS\n");
  console.log("=".repeat(60) + "\n");

  const students = await prisma.student.findMany();
  const projects = await prisma.project.findMany({
    include: { professor: true },
  });
  const allocations = await prisma.assignedProject.findMany({
    include: {
      student: true,
      project: { include: { professor: true } },
    },
  });

  // Statistics
  const allocatedStudents = new Set(allocations.map(a => a.studentId));
  const unallocatedStudents = students.filter(s => !allocatedStudents.has(s.id));

  const projectAllocationCount: Record<string, number> = {};
  for (const alloc of allocations) {
    projectAllocationCount[alloc.projectId] = (projectAllocationCount[alloc.projectId] || 0) + 1;
  }

  const fullyAllocatedProjects = projects.filter(
    p => (projectAllocationCount[p.id] || 0) >= p.capacity
  );
  const partiallyAllocatedProjects = projects.filter(
    p => (projectAllocationCount[p.id] || 0) > 0 && (projectAllocationCount[p.id] || 0) < p.capacity
  );
  const emptyProjects = projects.filter(
    p => !projectAllocationCount[p.id]
  );

  console.log("📈 STATISTICS\n");
  console.log(`   Total Students: ${students.length}`);
  console.log(`   Allocated: ${allocatedStudents.size} (${((allocatedStudents.size / students.length) * 100).toFixed(1)}%)`);
  console.log(`   Unallocated: ${unallocatedStudents.length}`);
  console.log("");
  console.log(`   Total Projects: ${projects.length}`);
  console.log(`   Fully Allocated: ${fullyAllocatedProjects.length}`);
  console.log(`   Partially Allocated: ${partiallyAllocatedProjects.length}`);
  console.log(`   Empty: ${emptyProjects.length}`);
  console.log("");

  // Show allocations by project
  console.log("📋 ALLOCATIONS BY PROJECT\n");

  const projectsWithAllocations = projects
    .filter(p => projectAllocationCount[p.id])
    .sort((a, b) => (projectAllocationCount[b.id] || 0) - (projectAllocationCount[a.id] || 0));

  for (const project of projectsWithAllocations.slice(0, 20)) {
    const projectAllocations = allocations.filter(a => a.projectId === project.id);
    console.log(`   ${project.projectNo}: ${project.title.substring(0, 40)}...`);
    console.log(`      Supervisor: ${project.professor?.name || project.supervisor}`);
    console.log(`      Capacity: ${projectAllocationCount[project.id]}/${project.capacity}`);
    console.log(`      Students: ${projectAllocations.map(a => a.student.rollNo).join(", ")}`);
    console.log("");
  }

  if (projectsWithAllocations.length > 20) {
    console.log(`   ... and ${projectsWithAllocations.length - 20} more projects\n`);
  }

  // Show unallocated students
  if (unallocatedStudents.length > 0) {
    console.log("⚠️  UNALLOCATED STUDENTS\n");
    for (const student of unallocatedStudents.slice(0, 10)) {
      const prefs = await prisma.preference.count({
        where: { studentId: student.id },
      });
      console.log(`   ${student.rollNo} - ${student.name} (had ${prefs} preferences)`);
    }
    if (unallocatedStudents.length > 10) {
      console.log(`   ... and ${unallocatedStudents.length - 10} more students\n`);
    }
  }

  // Preference satisfaction analysis
  console.log("\n🎯 PREFERENCE SATISFACTION\n");

  let firstChoice = 0, topThree = 0, topFive = 0, topTen = 0;

  for (const alloc of allocations) {
    const studentPrefs = await prisma.preference.findMany({
      where: { studentId: alloc.studentId },
      orderBy: { orderIndex: "asc" },
    });

    const prefIndex = studentPrefs.findIndex(p => p.projectId === alloc.projectId);
    if (prefIndex === 0) firstChoice++;
    if (prefIndex < 3) topThree++;
    if (prefIndex < 5) topFive++;
    if (prefIndex < 10) topTen++;
  }

  const total = allocations.length || 1;
  console.log(`   Got 1st choice: ${firstChoice} (${((firstChoice / total) * 100).toFixed(1)}%)`);
  console.log(`   Got top 3: ${topThree} (${((topThree / total) * 100).toFixed(1)}%)`);
  console.log(`   Got top 5: ${topFive} (${((topFive / total) * 100).toFixed(1)}%)`);
  console.log(`   Got top 10: ${topTen} (${((topTen / total) * 100).toFixed(1)}%)`);
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🎓 BTP ALLOCATION SIMULATION");
  console.log("=".repeat(60) + "\n");

  if (config.dryRun) {
    console.log("⚠️  DRY RUN MODE - No changes will be saved\n");
  }

  try {
    // Step 1: Optionally reset
    if (config.reset) {
      await clearExistingData();
    }

    // Step 2: Generate student preferences
    await generateStudentPreferences();

    // Step 3: Generate professor preferences
    await generateProfessorPreferences();

    // Step 4: Run allocation (only if not dry run)
    if (!config.dryRun) {
      const allocations = await runAllocation();
      console.log(`✅ Allocation complete! ${allocations.length} students allocated.\n`);

      // Step 5: Show results
      await showResults();
    } else {
      console.log("✅ Dry run complete. No changes were made.\n");
      console.log("   Run without --dry-run to actually simulate allocation.\n");
    }

  } catch (error) {
    console.error("❌ Error during simulation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
