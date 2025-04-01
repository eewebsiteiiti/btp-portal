"use client";

import { useEffect, useState } from "react";
import { StudentI, ProjectI } from "@/types";
import Loading from "../Loading";

const ProfessorResult = ({ professor_name }: { professor_name: string }) => {
  const [projectStudents, setProjectStudents] = useState<
    Record<string, string[]>
  >({});
  const [allProjects, setAllProjects] = useState<ProjectI[]>([]);
  const [allStudents, setAllStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assignedProjectsRes, projectsRes, studentsRes] =
          await Promise.all([
            fetch("/api/admin/assigned-projects").then((res) => res.json()),
            fetch("/api/project/get").then((res) => res.json()),
            fetch("/api/student/get").then((res) => res.json()),
          ]);

        setProjectStudents(assignedProjectsRes.data || {});
        setAllProjects(projectsRes.projects || []);
        setAllStudents(studentsRes.students || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map student_id to full student object
  const getSortedStudents = (studentIds: string[]) =>
    studentIds
      .map((id) => allStudents.find((student) => student._id === id))
      .filter((student): student is StudentI => student !== undefined);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Assigned Students</h1>
      </div>

      {/* Projects */}
      {Object.keys(projectStudents).length === 0 ? (
        <p className="text-center text-gray-500">
          Allotment process not started yet.
        </p>
      ) : (
        <div className="space-y-6">
          {allProjects
            .filter((project) => project.Supervisor === professor_name)
            .map((project) => (
              <div
                key={project._id}
                className="border rounded-xl shadow-lg p-6 bg-white"
              >
                {/* Project Info */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {project.Project_No} - {project.Title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    <strong>Domain:</strong> {project.Domain}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Supervisor:</strong> {project.Supervisor}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Co-Supervisor:</strong>{" "}
                    {project.Cosupervisor || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Capacity:</strong> {project.Capacity}
                  </p>
                </div>

                {/* Assigned Students */}
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Assigned Students:
                </h3>
                {projectStudents[project._id]?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 text-left">
                          <th className="px-4 py-2 border-b font-medium">
                            Name
                          </th>
                          <th className="px-4 py-2 border-b font-medium">
                            Email
                          </th>
                          <th className="px-4 py-2 border-b font-medium">
                            Roll No
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedStudents(projectStudents[project._id]).map(
                          (student) => (
                            <tr
                              key={student._id}
                              className="hover:bg-gray-50 transition"
                            >
                              <td className="px-4 py-2 border-b">
                                {student.name}
                              </td>
                              <td className="px-4 py-2 border-b">
                                {student.email}
                              </td>
                              <td className="px-4 py-2 border-b">
                                {student.roll_no}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    Project has been dropped
                  </p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProfessorResult;
