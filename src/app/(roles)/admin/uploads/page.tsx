"use client";
import { ChangeEvent, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProfessorI, ProjectI, StudentI } from "@/types";
import { toast } from "sonner";
import {
  FolderKanban,
  Users,
  GraduationCap,
  Upload,
  FileSpreadsheet,
  X,
  Loader2,
  Mail,
} from "lucide-react";

type UploadType = "project" | "professor" | "student";

type FileInfo = {
  name: string;
  count: number;
};

export default function AdminUploads() {
  const [professors, setProfessors] = useState<ProfessorI[]>([]);
  const [students, setStudents] = useState<StudentI[]>([]);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loadingType, setLoadingType] = useState<UploadType | null>(null);
  const [sendStudentEmails, setSendStudentEmails] = useState(false);
  const [sendProfessorEmails, setSendProfessorEmails] = useState(false);
  const [fileInfo, setFileInfo] = useState<Record<UploadType, FileInfo | null>>({
    project: null,
    professor: null,
    student: null,
  });

  const projectInputRef = useRef<HTMLInputElement>(null);
  const professorInputRef = useRef<HTMLInputElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    event: ChangeEvent<HTMLInputElement>,
    type: UploadType
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

        setFileInfo((prev) => ({
          ...prev,
          [type]: { name: file.name, count: parsedData.length },
        }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const clearFile = (type: UploadType) => {
    if (type === "project") {
      setProjects([]);
      if (projectInputRef.current) projectInputRef.current.value = "";
    } else if (type === "professor") {
      setProfessors([]);
      if (professorInputRef.current) professorInputRef.current.value = "";
    } else if (type === "student") {
      setStudents([]);
      if (studentInputRef.current) studentInputRef.current.value = "";
    }
    setFileInfo((prev) => ({ ...prev, [type]: null }));
  };

  const handleUpload = async (
    type: UploadType,
    data: ProfessorI[] | StudentI[] | ProjectI[]
  ) => {
    if (data.length === 0) {
      toast.error(`No ${type} data to upload`);
      return;
    }
    setLoadingType(type);
    try {
      const endpoint = `/api/${type}/create`;
      const body =
        type === "student"
          ? { data, sendEmails: sendStudentEmails }
          : type === "professor"
            ? { data, sendEmails: sendProfessorEmails }
            : { data };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        toast.success(
          `${data.length} ${type}${data.length > 1 ? "s" : ""} uploaded successfully`
        );
        clearFile(type);
      } else {
        toast.error(`Failed to upload ${type} data`);
      }
    } catch (error) {
      console.error(`Error uploading ${type} data:`, error);
      toast.error(`Error uploading ${type} data`);
    }
    setLoadingType(null);
  };

  const getInputRef = (type: UploadType) => {
    if (type === "project") return projectInputRef;
    if (type === "professor") return professorInputRef;
    return studentInputRef;
  };

  const uploadCards: {
    type: UploadType;
    title: string;
    description: string;
    icon: React.ReactNode;
    data: ProfessorI[] | StudentI[] | ProjectI[];
  }[] = [
    {
      type: "project",
      title: "Projects",
      description: "Upload project titles, domains, supervisors, and capacity",
      icon: <FolderKanban className="h-5 w-5" />,
      data: projects,
    },
    {
      type: "professor",
      title: "Professors",
      description: "Upload professor names, emails, and departments",
      icon: <Users className="h-5 w-5" />,
      data: professors,
    },
    {
      type: "student",
      title: "Students",
      description: "Upload student roll numbers, names, and emails",
      icon: <GraduationCap className="h-5 w-5" />,
      data: students,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Upload Data</h1>
        <p className="text-muted-foreground">
          Import data from Excel files (.xlsx, .xls)
        </p>
      </div>

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {uploadCards.map(({ type, title, description, icon, data }) => (
          <Card key={type} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {icon}
                {title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Hidden file input */}
              <input
                type="file"
                ref={getInputRef(type)}
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, type)}
                className="hidden"
              />

              {/* Drop zone / File info */}
              {fileInfo[type] ? (
                <div className="flex-1 border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-700 truncate max-w-[180px]">
                      {fileInfo[type]?.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {fileInfo[type]?.count} records found
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-700 hover:text-green-800 hover:bg-green-100"
                    onClick={() => clearFile(type)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => getInputRef(type).current?.click()}
                  className="flex-1 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] transition-colors cursor-pointer hover:bg-muted/50"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to select file</p>
                    <p className="text-xs text-muted-foreground">
                      .xlsx or .xls
                    </p>
                  </div>
                </button>
              )}

              {/* Email toggle for students and professors */}
              {(type === "student" || type === "professor") && (
                <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={`send-emails-${type}`} className="text-sm cursor-pointer">
                      Send credentials
                    </Label>
                  </div>
                  <Switch
                    id={`send-emails-${type}`}
                    checked={type === "student" ? sendStudentEmails : sendProfessorEmails}
                    onCheckedChange={type === "student" ? setSendStudentEmails : setSendProfessorEmails}
                  />
                </div>
              )}

              {/* Upload button */}
              <Button
                className="mt-4 w-full"
                onClick={() => handleUpload(type, data)}
                disabled={loadingType !== null || !fileInfo[type]}
              >
                {loadingType === type ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {title}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
