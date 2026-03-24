"use client";

import { useEffect, useState } from "react";
import { StudentI, ProjectI } from "@/types";

interface Props {
  rollNo: string;
  program?: string;
  domain?: string | null;
}

const StudentResult = ({ rollNo, program = "BTP", domain }: Props) => {
  const [projectStudents, setProjectStudents] = useState<
    Record<string, string[]>
  >({});
  const [allProjects, setAllProjects] = useState<ProjectI[]>([]);
  const [allStudents, setAllStudents] = useState<StudentI[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (program !== "BTP") params.set("program", program);
    if (domain) params.set("domain", domain);
    const queryStr = params.toString();

    const assignedEndpoint = program === "MTP" ? `/api/dpgc/assigned-projects${queryStr ? `?${queryStr}` : ""}` : "/api/admin/assigned-projects";
    const projectEndpoint = `/api/project/get?${new URLSearchParams({ program, ...(domain ? { domain } : {}) })}`;
    const studentEndpoint = `/api/student/get?${new URLSearchParams({ program, ...(domain ? { domain } : {}) })}`;

    const fetchAssignedProjects = async () => {
      try {
        const data = await fetch(assignedEndpoint);
        const res = await data.json();
        setProjectStudents(res.data);
      } catch (error) {
        console.error("Error fetching assigned projects:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const data = await fetch(projectEndpoint);
        const res = await data.json();
        setAllProjects(res.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const fetchStudents = async () => {
      try {
        const data = await fetch(studentEndpoint);
        const res = await data.json();
        setAllStudents(res.students);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchAssignedProjects();
    fetchProjects();
    fetchStudents();
  }, []);

  const getSortedStudents = (studentIds: string[]) => {
    return studentIds
      .map((id) => allStudents.find((student) => student.id === id))
      .filter((student): student is StudentI => student !== undefined);
  };

  // Find the project where the student with the roll number is assigned
  const filteredProjects = allProjects.filter((project) => {
    const students = getSortedStudents(projectStudents[project.id] || []);
    return students.some((student) => student.rollNo === rollNo);
  });

  // Find partner (if assigned to the same project)
  const findPartner = (projectId: string) => {
    const students = getSortedStudents(projectStudents[projectId] || []);
    return students.filter((student) => student.rollNo !== rollNo);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">
          Assigned Project for {rollNo}
        </h1>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center text-gray-500">
          No project assigned for roll number {rollNo}.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((project) => {
            const assignedStudents = getSortedStudents(
              projectStudents[project.id] || []
            );
            const mainStudent = assignedStudents.find(
              (student) => student.rollNo === rollNo
            );
            const partners = findPartner(project.id);

            return (
              <div
                key={project.id}
                className="border rounded-xl shadow-lg p-6 bg-white"
              >
                {/* Project Info */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {project.projectNo} - {project.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    <strong>Domain:</strong> {project.domain}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Supervisor:</strong> {project.supervisor}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Co-Supervisor:</strong>{" "}
                    {project.cosupervisor || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Capacity:</strong> {project.capacity}
                  </p>
                </div>

                {/* Assigned Students Table */}
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Assigned Students:
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 text-left">
                        <th className="px-4 py-2 border-b font-medium">Name</th>
                        <th className="px-4 py-2 border-b font-medium">
                          Email
                        </th>
                        <th className="px-4 py-2 border-b font-medium">
                          Roll No
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mainStudent && (
                        <tr className="hover:bg-gray-50 transition duration-200">
                          <td className="px-4 py-2 border-b">
                            {mainStudent.name}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {mainStudent.email}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {mainStudent.rollNo}
                          </td>
                        </tr>
                      )}
                      {partners.map((partner) => (
                        <tr
                          key={partner.id}
                          className="hover:bg-gray-50 transition duration-200"
                        >
                          <td className="px-4 py-2 border-b">{partner.name}</td>
                          <td className="px-4 py-2 border-b">
                            {partner.email}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {partner.rollNo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentResult;
