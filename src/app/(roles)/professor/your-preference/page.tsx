"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProfessorI, ProjectI, StudentI } from "@/types";
import Loading from "@/components/Loading";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import * as XLSX from "xlsx";

type ProjectData = {
  id: string;
  title: string;
  isDropped: boolean;
  students: Array<{
    id: string;
    name: string;
    preferenceRank: number;
  }>;
};

type ExcelData = {
  "Project Title": string;
  Status: string;
  "Student Name": string;
  "Roll Number": string;
  "Preference Rank": number;
};

const ProfessorPage = () => {
  const { data: session } = useSession();
  const [professor, setProfessor] = useState<ProfessorI | undefined>();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [students, setStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize student lookup for better performance
  const studentLookup = useMemo(() => {
    return students.reduce((acc: Record<string, string>, student) => {
      acc[student._id] = `${student.name} (${student.roll_no})`;
      return acc;
    }, {});
  }, [students]);

  // Memoize project data to avoid recalculating
  const processedProjects = useMemo(() => {
    if (!professor || !professor.projects) return [];

    return professor.projects.map((projectId): ProjectData => {
      const project = projects.find((p) => p._id === projectId);
      const isDropped = project?.dropProject || false;

      const projectStudents =
        professor.studentsPreference?.[projectId]?.flat() || [];

      return {
        id: projectId,
        title: project?.Title || "Unknown Project",
        isDropped,
        students: projectStudents.map((studentId, index) => ({
          id: studentId,
          name: studentLookup[studentId] || "Unknown Student",
          preferenceRank: index + 1,
        })),
      };
    });
  }, [professor, projects, studentLookup]);

  const exportToExcel = () => {
    if (!professor) return;

    // Prepare data for Excel
    const excelData: ExcelData[] = processedProjects.flatMap((project) => {
      if (project.isDropped) {
        return [
          {
            "Project Title": project.title,
            Status: "DROPPED",
            "Student Name": "",
            "Roll Number": "",
            "Preference Rank": 0,
          },
        ];
      }

      if (project.students.length === 0) {
        return [
          {
            "Project Title": project.title,
            Status: "ACTIVE",
            "Student Name": "No students assigned",
            "Roll Number": "",
            "Preference Rank": 0,
          },
        ];
      }

      return project.students.map((student) => {
        // Extract roll number from the student name (format: "Name (RollNo)")
        const rollNoMatch = student.name.match(/\(([^)]+)\)/);
        const rollNo = rollNoMatch ? rollNoMatch[1] : "";
        const name = student.name.replace(/\([^)]+\)/, "").trim();

        return {
          "Project Title": project.title,
          Status: "ACTIVE",
          "Student Name": name,
          "Roll Number": rollNo,
          "Preference Rank": student.preferenceRank,
        };
      });
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Project Preferences");

    // Generate Excel file
    XLSX.writeFile(workbook, `${professor.name}_Projects_Preferences.xlsx`, {
      compression: true,
    });
  };

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const email = session.user.email;
        const [profRes, projRes, studRes] = await Promise.all([
          fetch(`/api/professor/get?email=${email}`),
          fetch("/api/project/get"),
          fetch("/api/student/get"),
        ]);

        if (!profRes.ok || !projRes.ok || !studRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [profData, projData, studData] = await Promise.all([
          profRes.json(),
          projRes.json(),
          studRes.json(),
        ]);

        setProfessor(profData.professor);
        setProjects(projData.projects);
        setStudents(studData.students);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (loading) return <Loading message="Loading professor data..." />;
  if (error) return <p className="text-center text-red-500 text-lg">{error}</p>;
  if (!professor)
    return <p className="text-center text-lg">No professor data found</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Header Card */}
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Professor Information
          </CardTitle>
          <CardDescription className="text-lg">
            {professor.name}
          </CardDescription>
          <CardDescription className="text-gray-500">
            {professor.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 mt-4">
          <LogoutButton />
          <Button asChild>
            <Link href="/professor">
              <span className="text-secondary">Edit Your Preference</span>
            </Link>
          </Button>
          <Button onClick={exportToExcel} variant="outline">
            Download as Excel
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Card */}
      <Card className="p-6 shadow-md rounded-2xl border border-gray-200 space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">{professor.name}</h2>
          <p className="text-gray-600">{professor.email}</p>
          <p>
            Status:{" "}
            <span
              className={
                professor.submitStatus ? "text-green-500" : "text-red-500"
              }
            >
              {professor.submitStatus ? "Submitted" : "Pending"}
            </span>
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedProjects.map((project) => (
            <Card
              key={project.id}
              className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                project.isDropped
                  ? "border-gray-300 text-gray-400"
                  : "border-gray-300"
              }`}
            >
              {project.isDropped ? (
                <div className="items-center justify-center">
                  This project has been dropped.
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {project.title}
                  </h3>

                  {/* Students List */}
                  {project.students.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
                      <ul className="space-y-1 text-sm text-gray-700">
                        {project.students.map((student) => (
                          <li
                            key={student.id}
                            className="flex justify-between items-center px-2 py-1 hover:bg-gray-100 rounded-md"
                          >
                            <span>{student.name}</span>
                            <span className="text-xs text-gray-500">
                              #{student.preferenceRank}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No Students</p>
                  )}
                </>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProfessorPage;
