// /app/admin/uploads/page.tsx
"use client";
import { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProfessorI, ProjectI, StudentI } from "@/types";
import { toast } from "sonner";

export default function AdminUploads() {
  const [professors, setProfessors] = useState<ProfessorI[]>([]);
  const [students, setStudents] = useState<StudentI[]>([]);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendEmails, setSendEmails] = useState(false);

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
      toast.error(`No ${type} data to upload`);
      return;
    }
    setLoading(true);
    try {
      const endpoint = `/api/${type}/create`;
      const body = type === "student"
        ? { data, sendEmails }
        : { data };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        toast.success(`${type} data uploaded successfully`);
      } else {
        toast.error(`Failed to upload ${type} data`);
      }
    } catch (error) {
      console.error(`Error uploading ${type} data:`, error);
      toast.error(`Error uploading ${type} data`);
    }
    setLoading(false);
  };

  return (
    <Card className="p-6">
      <h2 className="text-4xl font-bold text-center mb-6">Upload Data</h2>
      <CardContent className="space-y-4">
        {/* Project Upload */}
        <div className="border p-4 rounded-lg">
          <label className="block mb-2">Upload Project Data</label>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "project")}
          />
          <Button
            className="mt-4"
            onClick={() => handleUpload("project", projects)}
            disabled={loading}
          >
            {loading ? "Uploading Project..." : "Upload Project"}
          </Button>
        </div>

        {/* Professor Upload */}
        <div className="border p-4 rounded-lg">
          <label className="block mb-2">Upload Professor Data</label>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "professor")}
          />
          <Button
            className="mt-4"
            onClick={() => handleUpload("professor", professors)}
            disabled={loading}
          >
            {loading ? "Uploading Professor..." : "Upload Professor"}
          </Button>
        </div>

        {/* Student Upload with Email Toggle */}
        <div className="border p-4 rounded-lg">
          <label className="block mb-2">Upload Student Data</label>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e, "student")}
          />
          <div className="flex items-center justify-between mt-4">
            <Button
              onClick={() => handleUpload("student", students)}
              disabled={loading}
            >
              {loading ? "Uploading Student..." : "Upload Student"}
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                id="send-emails"
                checked={sendEmails}
                onCheckedChange={setSendEmails}
              />
              <Label htmlFor="send-emails" className="text-sm">
                Send credential emails
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
