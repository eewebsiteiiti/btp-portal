"use client";
import { ChangeEvent, JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Professor from "@/models/Professor";

interface Professor  {
  faculty_id: string;
  name: string;
  email: string;
  password: string;

}
interface Student  {
  roll_no: string;
  name: string;
  email: string;
  password: string;
  cpi: number;
}
interface Project  {
  title: string;
  domain: string;
  description: string;
  capacity: number;
  supervisor: string;
  cosupervisor?: string;
}

export default function AdminUpload() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>, type: string) => {
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

        if (type === "professor") {
          setProfessors(parsedData as Professor[]);
        } else if (type === "student") {
          setStudents(parsedData as Student[]);
        } else if (type === "project") {
          setProjects(parsedData as Project[]);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveFile = (type: string) => {
    if (type === "professor") setProfessors([]);
    if (type === "student") setStudents([]);
    if (type === "project") setProjects([]);
  };

  const handleUpload = async (type: string, data: Professor[] | Student[] | Project[]) => {
    setLoading(true);
    try {
      const endpoint = type === "professor" ? "/api/professor/create" : type === "student" ? "/api/student/create" : "/api/project/create";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (response.ok) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} data uploaded successfully`);
        handleRemoveFile(type);
      } else {
        alert(`Failed to upload ${type} data`);
      }
    } catch (error) {
      console.error(`Error uploading ${type} data:`, error);
      alert(`Error uploading ${type} data`);
    }
    setLoading(false);
  };

  const renderTable = (data: Professor[] | Student[] | Project[], title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<unknown>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<unknown>> | Iterable<ReactNode> | null | undefined> | null | undefined, type: string) => (
    data.length > 0 && (
      <div className="mt-4">
        <h3 className="font-bold mb-2">{title}</h3>
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(data[0]).map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {Object.values(item as Professor | Student | Project).map((value, i) => (
                  <TableCell key={i}>{value as ReactNode}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button className="mt-4 mr-2" onClick={() => handleUpload(type, data)} disabled={loading}>
          {loading ? `Uploading ${title}...` : `Upload ${title}`}
        </Button>
        <Button className="mt-4 bg-red-500" onClick={() => handleRemoveFile(type)}>Remove {title}</Button>
      </div>
    )
  );

  return (
    <Card className="p-4 w-full max-w-2xl mx-auto mt-6">
      <CardContent>
        <div className="mb-4">
          <label className="block mb-2">Upload Professor Data</label>
          <Input type="file" accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, "professor")} />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Upload Student Data</label>
          <Input type="file" accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, "student")} />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Upload Project Data</label>
          <Input type="file" accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, "project")} />
        </div>
        <div>
        {renderTable(professors, "Professor Data", "professor")}
        {renderTable(students, "Student Data", "student")}
        {renderTable(projects, "Project Data", "project")}
        </div>
      </CardContent>
    </Card>
  );
}