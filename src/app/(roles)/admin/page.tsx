"use client";
import { ChangeEvent, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

interface Professor {
  name: string;
  email: string;
  password: string;
}
interface Student {
  roll_no: string;
  name: string;
  email: string;
  password: string;
}
interface Project {
  Domain: string;
  _id: string;
  Project_No: string;
  Title: string;
  Capacity: string;
  Nature_of_work: string;
  Comments: string;
  Supervisor: string;
  Cosupervisor?: string;
}

export default function AdminUpload() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    professors: 0,
    students: 0,
    projects: 0,
  });
  const fetchCounts = async () => {
    try {
      const res = await fetch("/api/data/count");
      const updatedData = await res.json();
      setCounts(updatedData);
    } catch (error) {
      console.error("Error fetching updated counts:", error);
    }
  };
  useEffect(() => {
    // const fetchCounts = async () => {
    //   try {
    //     const res = await fetch("/api/data/count");
    //     const data = await res.json();
    //     setCounts(data);
    //   } catch (error) {
    //     console.error("Error fetching counts:", error);
    //   }
    // };
    fetchCounts();
  }, [setCounts]);

  const handleFileUpload = (
    event: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        if (type === "professor") setProfessors(parsedData as Professor[]);
        else if (type === "student") setStudents(parsedData as Student[]);
        else if (type === "project") setProjects(parsedData as Project[]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async (
    type: string,
    data: Professor[] | Student[] | Project[]
  ) => {
    if (data.length === 0) {
      alert(`No ${type} data to upload`);
      return;
    }
    setLoading(true);
    try {
      const endpoint = `/api/${type}/create`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (response.ok) {
        alert(
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } data uploaded successfully`
        );
        // const fetchCounts = async () => {
        //   try {
        //     const res = await fetch("/api/data/count");
        //     const updatedData = await res.json();
        //     setCounts(updatedData);
        //   } catch (error) {
        //     console.error("Error fetching updated counts:", error);
        //   }
        // };
        fetchCounts();
      } else {
        alert(`Failed to upload ${type} data`);
      }
    } catch (error) {
      console.error(`Error uploading ${type} data:`, error);
      alert(`Error uploading ${type} data`);
    }
    setLoading(false);
  };

  const handleClearDatabase = async (type: string) => {
    try {
      const endpoint = `/api/${type}/delete`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert(
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } data cleared successfully`
        );
        setCounts((prev) => ({ ...prev, [type]: 0 }));
      } else {
        alert(`Failed to clear ${type} data`);
      }
      // const fetchCounts = async () => {
      //   try {
      //     const res = await fetch("/api/data/count");
      //     const updatedData = await res.json();
      //     setCounts(updatedData);
      //   } catch (error) {
      //     console.error("Error fetching updated counts:", error);
      //   }
      // };
      fetchCounts();
    } catch (error) {
      console.error(`Error clearing ${type} data:`, error);
      alert(`Error clearing ${type} data`);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen p-4">
      <Card className="p-6 w-full md:w-2/3 mx-auto relative">
        <h2 className="text-4xl font-bold text-center mb-6">Welcome Admin</h2>
        <div className="absolute top-4 right-4 bg-red-500">
          <LogoutButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 w-full mx-auto mb-4">
          {[
            {
              label: "Professors",
              count: counts.professors,
              type: "professor",
            },
            { label: "Students", count: counts.students, type: "student" },
            { label: "Projects", count: counts.projects, type: "project" },
          ].map(({ label, count, type }) => (
            <>
              <div
                key={type}
                className="p-6 bg-primary shadow-md rounded-lg flex flex-col items-center text-center"
              >
                <Link href={`/admin/${type}s`}>
                  <span className="text-secondary text-xl font-semibold">
                    {label}
                  </span>
                </Link>
                <span className="text-secondary text-2xl font-bold">
                  {count}
                </span>
                <Button
                  className="mt-4 bg-red-600"
                  onClick={() => {
                    handleClearDatabase(type);
                  }}
                >
                  Clear {label}
                </Button>
              </div>
            </>
          ))}
        </div>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Professor", type: "professor", data: professors },
              { label: "Student", type: "student", data: students },
              { label: "Project", type: "project", data: projects },
            ].map(({ label, type, data }) => (
              <div key={type} className="border p-4 rounded-lg">
                <label className="block mb-2">Upload {label} Data</label>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleFileUpload(e, type)}
                />
                <Button
                  className="mt-4"
                  onClick={() => handleUpload(type, data)}
                  disabled={loading}
                >
                  {loading ? `Uploading ${label}...` : `Upload ${label}`}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
