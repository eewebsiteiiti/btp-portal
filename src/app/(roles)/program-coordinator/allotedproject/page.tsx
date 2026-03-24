"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { StudentI, ProjectI } from "@/types";
import * as XLSX from "xlsx";
import Loading from "@/components/Loading";

const PCAllottedPage = () => {
  const { data: session } = useSession();
  const domain = session?.user?.domain || "";
  const [projectStudents, setProjectStudents] = useState<Record<string, string[]>>({});
  const [allProjects, setAllProjects] = useState<ProjectI[]>([]);
  const [allStudents, setAllStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!domain) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assignedRes, projectsRes, studentsRes] = await Promise.all([
          fetch(`/api/dpgc/assigned-projects?domain=${domain}`).then((r) => r.json()),
          fetch(`/api/project/get?program=MTP&domain=${domain}`).then((r) => r.json()),
          fetch(`/api/student/get?program=MTP&domain=${domain}`).then((r) => r.json()),
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
  }, [domain]);

  const getSortedStudents = (ids: string[]) =>
    ids.map((id) => allStudents.find((s) => s.id === id)).filter((s): s is StudentI => !!s);

  const handleExport = () => {
    const data: unknown[] = [];
    allProjects.forEach((p) => {
      const students = getSortedStudents(projectStudents[p.id] || []);
      if (students.length > 0) {
        students.forEach((s) => {
          data.push({ "Project No": p.projectNo, Title: p.title, Supervisor: p.supervisor, "Student Name": s.name, "Roll No": s.rollNo, Email: s.email });
        });
      } else {
        data.push({ "Project No": p.projectNo, Title: p.title, Supervisor: p.supervisor, "Student Name": "Unassigned", "Roll No": "-", Email: "-" });
      }
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allocations");
    XLSX.writeFile(wb, `MTP_Allocations_${domain}.xlsx`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Assigned Projects ({domain})</h1>
        <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Export to Excel</button>
      </div>

      {loading ? <Loading message="Loading..." /> : Object.keys(projectStudents).length === 0 ? (
        <div className="text-center text-gray-500">Allotment not started yet.</div>
      ) : (
        <div className="space-y-6">
          {allProjects.map((project) => (
            <div key={project.id} className="border rounded-xl shadow-lg p-6 bg-white">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">{project.projectNo} - {project.title}</h2>
                <p className="text-sm text-gray-600"><strong>Supervisor:</strong> {project.supervisor}</p>
                <p className="text-sm text-gray-600"><strong>Capacity:</strong> {project.capacity}</p>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Assigned Students:</h3>
              {projectStudents[project.id]?.length > 0 ? (
                <table className="w-full border-collapse border rounded-lg overflow-hidden">
                  <thead><tr className="bg-gray-100 text-gray-700 text-left"><th className="px-4 py-2 border-b">Name</th><th className="px-4 py-2 border-b">Email</th><th className="px-4 py-2 border-b">Roll No</th></tr></thead>
                  <tbody>
                    {getSortedStudents(projectStudents[project.id]).map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50"><td className="px-4 py-2 border-b">{s.name}</td><td className="px-4 py-2 border-b">{s.email}</td><td className="px-4 py-2 border-b">{s.rollNo}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-sm text-gray-500">No students assigned.</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PCAllottedPage;
