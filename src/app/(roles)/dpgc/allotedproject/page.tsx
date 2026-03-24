"use client";

import { useEffect, useState } from "react";
import { StudentI, ProjectI } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from "xlsx";
import Loading from "@/components/Loading";

const DOMAINS = ["ALL", "CSP", "PSPE", "VDN"];

const MtpAllottedPage = () => {
  const [projectStudents, setProjectStudents] = useState<Record<string, string[]>>({});
  const [allProjects, setAllProjects] = useState<ProjectI[]>([]);
  const [allStudents, setAllStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const domainParam = activeDomain !== "ALL" ? `&domain=${activeDomain}` : "";
        const [assignedRes, projectsRes, studentsRes] = await Promise.all([
          fetch(`/api/dpgc/assigned-projects?${activeDomain !== "ALL" ? `domain=${activeDomain}` : ""}`).then((r) => r.json()),
          fetch(`/api/project/get?program=MTP${domainParam}`).then((r) => r.json()),
          fetch(`/api/student/get?program=MTP${domainParam}`).then((r) => r.json()),
        ]);
        setProjectStudents(assignedRes.data);
        setAllProjects(projectsRes.projects);
        setAllStudents(studentsRes.students);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeDomain]);

  const getSortedStudents = (studentIds: string[]) => {
    return studentIds.map((id) => allStudents.find((s) => s.id === id)).filter((s): s is StudentI => s !== undefined);
  };

  const handleExportToExcel = () => {
    const exportData: unknown[] = [];
    allProjects.forEach((project) => {
      const students = getSortedStudents(projectStudents[project.id] || []);
      if (students.length > 0) {
        students.forEach((student) => {
          exportData.push({
            "Project No": project.projectNo, "Project Title": project.title, Domain: project.domain,
            Supervisor: project.supervisor, "Co-Supervisor": project.cosupervisor || "N/A",
            "Student Name": student.name, "Student Email": student.email, "Roll No": student.rollNo,
          });
        });
      } else {
        exportData.push({
          "Project No": project.projectNo, "Project Title": project.title, Domain: project.domain,
          Supervisor: project.supervisor, "Co-Supervisor": project.cosupervisor || "N/A",
          "Student Name": "No student assigned", "Student Email": "-", "Roll No": "-",
        });
      }
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MTP Allocations");
    XLSX.writeFile(workbook, "MTP_Project_Allocation.xlsx");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">MTP Assigned Projects</h1>
        <button onClick={handleExportToExcel} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Export to Excel</button>
      </div>

      <div className="mb-6">
        <Tabs value={activeDomain} onValueChange={setActiveDomain}>
          <TabsList>{DOMAINS.map((d) => (<TabsTrigger key={d} value={d}>{d}</TabsTrigger>))}</TabsList>
        </Tabs>
      </div>

      {loading ? <Loading message="Loading MTP assigned projects..." /> : Object.keys(projectStudents).length === 0 ? (
        <div className="text-center text-gray-500">MTP allotment process not started yet.</div>
      ) : (
        <div className="space-y-6">
          {allProjects.map((project) => (
            <div key={project.id} className="border rounded-xl shadow-lg p-6 bg-white">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">{project.projectNo} - {project.title}</h2>
                <p className="text-sm text-gray-600"><strong>Domain:</strong> {project.domain}</p>
                <p className="text-sm text-gray-600"><strong>Supervisor:</strong> {project.supervisor}</p>
                <p className="text-sm text-gray-600"><strong>Co-Supervisor:</strong> {project.cosupervisor || "N/A"}</p>
                <p className="text-sm text-gray-600"><strong>Capacity:</strong> {project.capacity}</p>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Assigned Students:</h3>
              {projectStudents[project.id]?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border rounded-lg overflow-hidden">
                    <thead><tr className="bg-gray-100 text-gray-700 text-left"><th className="px-4 py-2 border-b font-medium">Name</th><th className="px-4 py-2 border-b font-medium">Email</th><th className="px-4 py-2 border-b font-medium">Roll No</th></tr></thead>
                    <tbody>
                      {getSortedStudents(projectStudents[project.id]).map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition duration-200">
                          <td className="px-4 py-2 border-b">{student.name}</td>
                          <td className="px-4 py-2 border-b">{student.email}</td>
                          <td className="px-4 py-2 border-b">{student.rollNo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (<p className="text-sm text-gray-500 mt-2">No students assigned.</p>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MtpAllottedPage;
