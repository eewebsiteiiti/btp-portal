"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ProfessorI, ProjectI, StudentI } from "@/types";

const ProfessorPage = () => {
  const [professors, setProfessors] = useState<ProfessorI[]>([]);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [students, setStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profRes, projRes, studRes] = await Promise.all([
          fetch("/api/professor/get"),
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

        setProfessors(profData.professors);
        setProjects(projData.projects);
        setStudents(studData.students);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProjectTitle = (projectId: string) =>
    projects.find((p) => p._id === projectId)?.Title || "Unknown Project";

  const getStudent = (studentId: string) => {
    const s = students.find((s) => s._id === studentId);
    const name = s?.name;
    const roll_no = s?.roll_no;
    return `${name}(${roll_no})`;
  };
  // students.find((s) => s._id === studentId)?.name || "NA";

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            📚 Professor Management
          </h1>
          <Link href="/admin" className="text-blue-500 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Loading and Error State */}
      {loading ? (
        <p className="text-center text-lg font-medium animate-pulse">
          Loading professors...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 text-lg">{error}</p>
      ) : (
        professors.map((prof) => (
          <Card
            key={prof._id}
            className="p-6 shadow-md rounded-2xl border border-gray-200 space-y-4"
          >
            {/* Professor Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">{prof.name}</h2>
              <p className="text-gray-600">{prof.email}</p>
              <p>
                Status:{" "}
                {prof.submitStatus ? (
                  <span className="text-green-500">Submitted</span>
                ) : (
                  <span className="text-red-500">Pending</span>
                )}
              </p>
            </div>

            {/* Projects (Grid) */}
            <div className="grid grid-cols-2 gap-4">
              {prof.projects?.map((projectId) => (
                <Card
                  key={projectId}
                  className="p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {getProjectTitle(projectId)}
                  </h3>

                  {/* Students (Scrollable) */}
                  {prof.studentsPreference?.[projectId]?.length ? (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
                      <ul className="space-y-1 text-sm text-gray-700">
                        {prof.studentsPreference[projectId]
                          .flat()
                          .map((studentId, index) => (
                            <li
                              key={studentId}
                              className="flex justify-between items-center px-2 py-1 hover:bg-gray-100 rounded-md"
                            >
                              <span>{getStudent(studentId)}</span>
                              <span className="text-xs text-gray-500">
                                #{index + 1}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No Students</p>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default ProfessorPage;
