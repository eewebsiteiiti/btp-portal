"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Table, TableBody, TableCell, TableHeader, TableHead, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown, ChevronUp, GraduationCap, CheckCircle, Clock, Search, Download, Users, User,
} from "lucide-react";
import { StudentI } from "@/types";
import * as XLSX from "xlsx";
import Loading from "@/components/Loading";

const PCStudentsPage = () => {
  const { data: session } = useSession();
  const domain = session?.user?.domain || "";
  const [students, setStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectIdNumberMap, setProjectIdNumberMap] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!domain) return;
    const fetchData = async () => {
      try {
        const [studRes, projRes] = await Promise.all([
          fetch(`/api/student/get?program=MTP&domain=${domain}`),
          fetch(`/api/project/get?program=MTP&domain=${domain}`),
        ]);
        if (!studRes.ok || !projRes.ok) throw new Error("Failed to fetch");
        const [studData, projData] = await Promise.all([studRes.json(), projRes.json()]);
        setStudents(studData.students);
        const numMap: Record<string, string> = {};
        for (const proj of projData.projects) numMap[proj.id] = proj.projectNo;
        setProjectIdNumberMap(numMap);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [domain]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleExportToExcel = () => {
    const formattedData = students.map((s) => ({
      Roll_No: s.rollNo, Name: s.name, Email: s.email, CPI: s.cpi,
      Domain: s.domain, Submit_Status: s.submitStatus ? "Submitted" : "Pending",
    }));
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `MTP_Students_${domain}.xlsx`);
  };

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: students.length,
    submitted: students.filter((s) => s.submitStatus).length,
    pending: students.filter((s) => !s.submitStatus).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students ({domain})</h1>
          <p className="text-muted-foreground">View MTP students in your domain</p>
        </div>
        <Button onClick={handleExportToExcel} className="gap-2"><Download className="h-4 w-4" />Export</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle><GraduationCap className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.submitted}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle><Clock className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{stats.pending}</div></CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {loading ? <Loading message="Loading students..." /> : error ? (
        <Card className="p-6"><p className="text-center text-red-500">{error}</p></Card>
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
                {filtered.length > 0 ? filtered.map((student) => (
                  <React.Fragment key={student.id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-medium">{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell>
                        {student.preferences.length > 0 ? (
                          <div className="space-y-1">
                            {student.preferences.slice(0, 3).map((pref, key) => (
                              <div key={pref.projectId} className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs w-5 h-5 p-0 justify-center">{key + 1}</Badge>
                                <span>Project {projectIdNumberMap[pref.projectId] || "N/A"}</span>
                                {pref.isGroup ? <Badge variant="secondary" className="text-xs gap-1"><Users className="h-3 w-3" />Group</Badge> : <Badge variant="outline" className="text-xs gap-1"><User className="h-3 w-3" />Solo</Badge>}
                              </div>
                            ))}
                            {student.preferences.length > 3 && (
                              <Button variant="ghost" size="sm" onClick={() => toggleRow(student.id)} className="h-7 px-2 text-xs text-primary">
                                {expandedRows.has(student.id) ? (<>Hide <ChevronUp className="h-3 w-3 ml-1" /></>) : (<>+{student.preferences.length - 3} more <ChevronDown className="h-3 w-3 ml-1" /></>)}
                              </Button>
                            )}
                          </div>
                        ) : <span className="text-muted-foreground text-sm">No preferences</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.submitStatus ? "default" : "secondary"}>
                          {student.submitStatus ? <><CheckCircle className="h-3 w-3 mr-1" />Submitted</> : <><Clock className="h-3 w-3 mr-1" />Pending</>}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(student.id) && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/30 p-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {student.preferences.map((pref, key) => (
                              <div key={pref.projectId} className="border rounded-lg p-3 bg-background">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">#{key + 1}</Badge>
                                  <span className="font-medium text-sm">Project {projectIdNumberMap[pref.projectId] || "N/A"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No students found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PCStudentsPage;
