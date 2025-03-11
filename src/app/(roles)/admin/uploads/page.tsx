// /app/admin/uploads/page.tsx
"use client";
import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProfessorI, ProjectI, StudentI } from "@/types";

export default function AdminUploads() {
  const [professors, setProfessors] = useState<ProfessorI[]>([]);
  const [students, setStudents] = useState<StudentI[]>([]);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState(false);

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

        if (type === "professor") setProfessors(parsedData as ProfessorI[]);
        else if (type === "student") setStudents(parsedData as StudentI[]);
        else if (type === "project") setProjects(parsedData as ProjectI[]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async (
    type: string,
    data: ProfessorI[] | StudentI[] | ProjectI[]
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
        alert(`${type} data uploaded successfully`);
      } else {
        alert(`Failed to upload ${type} data`);
      }
    } catch (error) {
      console.error(`Error uploading ${type} data:`, error);
      alert(`Error uploading ${type} data`);
    }
    setLoading(false);
  };

  return (
    <Card className="p-6">
      <h2 className="text-4xl font-bold text-center mb-6">Upload Data</h2>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
