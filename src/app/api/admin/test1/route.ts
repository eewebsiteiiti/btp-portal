import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Test route to initialize professor and student preferences
export async function GET() {
  try {
    const professors = await prisma.professor.findMany({
      include: { projects: true },
    });

    const students = await prisma.student.findMany({
      include: { preferences: true },
    });

    const projects = await prisma.project.findMany({
      where: { dropProject: false },
    });

    // Pair up ~40% of students randomly
    const shuffledStudents = shuffleArray(students);
    const pairCount = Math.floor(shuffledStudents.length * 0.2); // 20% of students = 40% involved in pairs
    const pairs: { a: typeof students[0]; b: typeof students[0] }[] = [];
    const pairedStudentIds = new Set<string>();

    for (let i = 0; i < pairCount * 2 && i + 1 < shuffledStudents.length; i += 2) {
      pairs.push({ a: shuffledStudents[i], b: shuffledStudents[i + 1] });
      pairedStudentIds.add(shuffledStudents[i].id);
      pairedStudentIds.add(shuffledStudents[i + 1].id);
    }

    // Build a map: studentId -> partnerRollNumber
    const partnerMap = new Map<string, string>();
    for (const pair of pairs) {
      partnerMap.set(pair.a.id, pair.b.rollNo);
      partnerMap.set(pair.b.id, pair.a.rollNo);
    }

    // Pre-decide which projects are group prefs for each pair
    // Both partners must agree on the same projects for grouping to work
    const pairGroupProjects = new Map<string, Set<string>>(); // pairKey -> set of projectIds
    for (const pair of pairs) {
      const groupProjectIds = new Set<string>();
      for (const project of projects) {
        if (Math.random() < 0.5) {
          groupProjectIds.add(project.id);
        }
      }
      // Store under both student IDs
      pairGroupProjects.set(pair.a.id, groupProjectIds);
      pairGroupProjects.set(pair.b.id, groupProjectIds);
    }

    // Fill student preferences (randomize project order) — wrapped in transaction
    await prisma.$transaction(
      students.flatMap((student) => {
        const shuffledProjects = shuffleArray(projects);
        const isPaired = pairedStudentIds.has(student.id);
        const partnerRoll = partnerMap.get(student.id) || "";
        const groupProjects = pairGroupProjects.get(student.id);

        return [
          prisma.preference.deleteMany({
            where: { studentId: student.id },
          }),
          prisma.preference.createMany({
            data: shuffledProjects.map((project, index) => {
              const isGroup =
                isPaired && groupProjects?.has(project.id) === true;
              return {
                studentId: student.id,
                projectId: project.id,
                orderIndex: index,
                isGroup,
                partnerRollNumber: isGroup ? partnerRoll : "",
                status: isGroup ? "Success" : "Pending",
              };
            }),
          }),
          prisma.student.update({
            where: { id: student.id },
            data: { submitStatus: true },
          }),
        ];
      })
    );

    // Re-fetch preferences to build professor rankings with group info
    const allPreferences = await prisma.preference.findMany({
      include: { student: true },
    });

    // Build rollNo -> student map for O(1) partner lookup
    const studentsByRollNo = new Map(students.map((s) => [s.rollNo, s]));

    // Fill professor preferences (aware of pairs) — wrapped in transaction
    const professorUpdates = professors.map((professor) => {
      const studentsPreference: Record<string, string[][]> = {};

      for (const project of professor.projects) {
        const prefsForProject = allPreferences.filter(
          (p) => p.projectId === project.id
        );
        const shuffledPrefs = shuffleArray(prefsForProject);
        const rankedStudents: string[][] = [];
        const addedStudents = new Set<string>();

        for (const pref of shuffledPrefs) {
          if (addedStudents.has(pref.student.id)) continue;

          if (pref.isGroup && pref.partnerRollNumber) {
            const partner = studentsByRollNo.get(pref.partnerRollNumber);
            if (partner && !addedStudents.has(partner.id)) {
              rankedStudents.push([pref.student.id, partner.id]);
              addedStudents.add(pref.student.id);
              addedStudents.add(partner.id);
            } else {
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

      return prisma.professor.update({
        where: { id: professor.id },
        data: {
          studentsPreference: JSON.stringify(studentsPreference),
          submitStatus: true,
        },
      });
    });

    await prisma.$transaction(professorUpdates);

    return NextResponse.json({
      message: "Success - filled preferences for professors and students",
      data: {
        professors: professors.length,
        students: students.length,
        pairs: pairs.length,
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error processing request", error: errorMessage },
      { status: 500 }
    );
  }
}
