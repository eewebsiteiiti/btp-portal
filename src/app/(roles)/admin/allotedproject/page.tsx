"use client";

import { useEffect, useState } from "react";
import { StudentI, ProjectI } from "@/types";
import * as XLSX from "xlsx";
import Loading from "@/components/Loading";

const Page = () => {
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

        setProjectStudents(assignedProjectsRes.data);
        setAllProjects(projectsRes.projects);
        setAllStudents(studentsRes.students);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSortedStudents = (studentIds: string[]) => {
    return studentIds
      .map((id) => allStudents.find((student) => student._id === id))
      .filter((student): student is StudentI => student !== undefined);
  };

  // Function to export data to Excel
  const handleExportToExcel = () => {
    const exportData: unknown[] = [];

    allProjects.forEach((project) => {
      const students = getSortedStudents(projectStudents[project._id] || []);

      if (students.length > 0) {
        students.forEach((student) => {
          exportData.push({
            "Project No": project.Project_No,
            "Project Title": project.Title,
            Domain: project.Domain,
            Supervisor: project.Supervisor,
            "Co-Supervisor": project.Cosupervisor || "N/A",
            "Student Name": student.name,
            "Student Email": student.email,
            "Roll No": student.roll_no,
          });
        });
      } else {
        exportData.push({
          "Project No": project.Project_No,
          "Project Title": project.Title,
          Domain: project.Domain,
          Supervisor: project.Supervisor,
          "Co-Supervisor": project.Cosupervisor || "N/A",
          "Student Name": "No student assigned",
          "Student Email": "-",
          "Roll No": "-",
        });
      }
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Project Data");

    // Create Excel file and trigger download
    XLSX.writeFile(workbook, "Project_Allocation.xlsx");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Assigned Projects</h1>
        <button
          onClick={handleExportToExcel}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Export to Excel
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <Loading message="Loading assigned projects..." />
      ) : Object.keys(projectStudents).length === 0 ? (
        <div className="text-center text-gray-500">
          Allotment process not started yet.
        </div>
      ) : (
        <div className="space-y-6">
          {allProjects.map((project) => (
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

              {/* Assigned Students Table */}
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Assigned Students:
              </h3>
              {projectStudents[project._id]?.length > 0 ? (
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
                      {getSortedStudents(projectStudents[project._id]).map(
                        (student) => (
                          <tr
                            key={student._id}
                            className="hover:bg-gray-50 transition duration-200"
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
                  No Studnets assigned.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
