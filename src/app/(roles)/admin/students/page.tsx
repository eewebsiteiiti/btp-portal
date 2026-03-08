"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  CheckCircle,
  Clock,
  Search,
  Download,
  Users,
  User,
} from "lucide-react";
import { StudentI } from "@/types";
import * as XLSX from "xlsx";
import Loading from "@/components/Loading";
import { toast } from "sonner";

const StudentsPage = () => {
  const [students, setStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projectIdNumberMap, setProjectIdNumberMap] = useState<{
    [key: string]: string;
  }>({});
  const [projectIdTitleMap, setProjectIdTitleMap] = useState<{
    [key: string]: string;
  }>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/student/get");
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data.students);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/project/get");
        const data = await response.json();
        const numMap: { [key: string]: string } = {};
        const titleMap: { [key: string]: string } = {};
        for (const proj of data.projects) {
          numMap[proj.id] = proj.projectNo;
          titleMap[proj.id] = proj.title;
        }
        setProjectIdNumberMap(numMap);
        setProjectIdTitleMap(titleMap);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchProjects();
    fetchStudents();
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newExpandedRows = new Set(prev);
      if (newExpandedRows.has(id)) {
        newExpandedRows.delete(id);
      } else {
        newExpandedRows.add(id);
      }
      return newExpandedRows;
    });
  };

  const handleExportToExcel = () => {
    const maxPrefs = Math.max(...students.map((s) => s.preferences.length), 0);

    const formattedData = students.map((student) => {
      const row: Record<string, string | number | null> = {
        Roll_No: student.rollNo,
        Name: student.name,
        Email: student.email,
        CPI: student.cpi,
        Submit_Status: student.submitStatus ? "Submitted" : "Pending",
      };

      for (let i = 0; i < maxPrefs; i++) {
        const pref = student.preferences[i];
        if (pref) {
          const projNo = projectIdNumberMap[pref.projectId] || "N/A";
          const title = projectIdTitleMap[pref.projectId] || "";
          const type = pref.isGroup ? "Group" : "Solo";
          const partner = pref.isGroup && pref.partnerRollNumber
            ? ` | Partner: ${pref.partnerRollNumber}`
            : "";
          row[`Pref_${i + 1}`] = `${projNo} - ${title} (${type}${partner})`;
        } else {
          row[`Pref_${i + 1}`] = "";
        }
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Auto-fit column widths
    const colWidths = Object.keys(formattedData[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...formattedData.map((row) => String(row[key] ?? "").length)
      );
      return { wch: Math.min(maxLen + 2, 50) };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "StudentData.xlsx");
  };

  const toggleSubmitStatus = async (studentId: string, current: boolean) => {
    try {
      const res = await fetch("/api/student/submit-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, submitStatus: !current }),
      });
      if (!res.ok) throw new Error();
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, submitStatus: !current } : s
        )
      );
      toast.success(`Student marked as ${!current ? "submitted" : "pending"}`);
    } catch {
      toast.error("Failed to update submit status");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: students.length,
    submitted: students.filter((s) => s.submitStatus).length,
    pending: students.filter((s) => !s.submitStatus).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage student data and view their project preferences
          </p>
        </div>
        <Button onClick={handleExportToExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submitted
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, roll no, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <Loading message="Loading students..." />
      ) : error ? (
        <Card className="p-6">
          <p className="text-center text-red-500">{error}</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Roll No</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Preferences</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <React.Fragment key={student.id}>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {student.rollNo}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.email}
                        </TableCell>
                        <TableCell>
                          {student.preferences.length > 0 ? (
                            <div className="space-y-1">
                              {student.preferences.slice(0, 3).map((pref, key) => (
                                <div
                                  key={pref.projectId}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <Badge variant="outline" className="text-xs w-5 h-5 p-0 justify-center">
                                    {key + 1}
                                  </Badge>
                                  <span>
                                    Project {projectIdNumberMap[pref.projectId] || "N/A"}
                                  </span>
                                  {pref.isGroup ? (
                                    <Badge variant="secondary" className="text-xs gap-1">
                                      <Users className="h-3 w-3" />
                                      Group
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs gap-1">
                                      <User className="h-3 w-3" />
                                      Solo
                                    </Badge>
                                  )}
                                </div>
                              ))}
                              {student.preferences.length > 3 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRow(student.id)}
                                  className="h-7 px-2 text-xs text-primary"
                                >
                                  {expandedRows.has(student.id) ? (
                                    <>
                                      Hide <ChevronUp className="h-3 w-3 ml-1" />
                                    </>
                                  ) : (
                                    <>
                                      +{student.preferences.length - 3} more{" "}
                                      <ChevronDown className="h-3 w-3 ml-1" />
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No preferences
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={student.submitStatus ? "default" : "secondary"}>
                              {student.submitStatus ? (
                                <><CheckCircle className="h-3 w-3 mr-1" /> Submitted</>
                              ) : (
                                <><Clock className="h-3 w-3 mr-1" /> Pending</>
                              )}
                            </Badge>
                            <Button
                              size="sm"
                              variant={student.submitStatus ? "outline" : "default"}
                              onClick={() => toggleSubmitStatus(student.id, student.submitStatus)}
                            >
                              {student.submitStatus ? "Mark Pending" : "Mark Submitted"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedRows.has(student.id) && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/30 p-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {student.preferences.map((pref, key) => (
                                <div
                                  key={pref.projectId}
                                  className="border rounded-lg p-3 bg-background"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      #{key + 1}
                                    </Badge>
                                    <span className="font-medium text-sm">
                                      Project {projectIdNumberMap[pref.projectId] || "N/A"}
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-xs text-muted-foreground">
                                    {pref.isGroup ? (
                                      <>
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          Partner: {pref.partnerRollNumber}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          Status:{" "}
                                          {pref.status === "Success" ? (
                                            <Badge variant="default" className="text-[10px] h-4">
                                              Matched
                                            </Badge>
                                          ) : (
                                            <Badge variant="secondary" className="text-[10px] h-4">
                                              Pending
                                            </Badge>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        Solo project
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentsPage;
