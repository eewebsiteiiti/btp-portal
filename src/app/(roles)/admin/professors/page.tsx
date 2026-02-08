"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProfessorI, StudentI } from "@/types";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Users,
  Mail,
  FolderKanban,
  CheckCircle,
  Clock,
  Search,
  GraduationCap,
} from "lucide-react";

const ProfessorPage = () => {
  const [professors, setProfessors] = useState<ProfessorI[]>([]);
  const [students, setStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profRes, studRes] = await Promise.all([
          fetch("/api/professor/get"),
          fetch("/api/student/get"),
        ]);

        if (!profRes.ok || !studRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [profData, studData] = await Promise.all([
          profRes.json(),
          studRes.json(),
        ]);

        setProfessors(profData.professors);
        setStudents(studData.students);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStudent = (studentId: string) => {
    const s = students.find((s) => s.id === studentId);
    return { name: s?.name || "Unknown", rollNo: s?.rollNo || "N/A" };
  };

  const toggleSubmitStatus = async (profId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/professor/submit-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professorId: profId, submitStatus: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setProfessors((prev) =>
        prev.map((p) => (p.id === profId ? { ...p, submitStatus: !currentStatus } : p))
      );
      toast.success(`Marked as ${!currentStatus ? "submitted" : "pending"}`);
    } catch {
      toast.error("Failed to update submit status");
    }
  };

  const filteredProfessors = professors.filter(
    (prof) =>
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: professors.length,
    submitted: professors.filter((p) => p.submitStatus).length,
    pending: professors.filter((p) => !p.submitStatus).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Professors</h1>
        <p className="text-muted-foreground">
          Manage professor data and view their student preferences
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Professors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
          placeholder="Search professors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading and Error State */}
      {loading ? (
        <Loading message="Loading professors..." />
      ) : error ? (
        <Card className="p-6">
          <p className="text-center text-red-500">{error}</p>
        </Card>
      ) : filteredProfessors.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">No professors found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProfessors.map((prof) => (
            <Card key={prof.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{prof.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {prof.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={prof.submitStatus ? "default" : "secondary"}>
                      {prof.submitStatus ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Submitted</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> Pending</>
                      )}
                    </Badge>
                    <Button
                      size="sm"
                      variant={prof.submitStatus ? "outline" : "default"}
                      onClick={() => toggleSubmitStatus(prof.id, prof.submitStatus)}
                    >
                      {prof.submitStatus ? "Mark Pending" : "Mark Submitted"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {prof.projects && prof.projects.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FolderKanban className="h-4 w-4" />
                      Projects ({prof.projects.length})
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {prof.projects.map((project) => {
                        const rawPrefs = (prof.studentsPreference?.[project.id] || []).flat();
                        // Handle both formats: plain string IDs or student objects
                        const studentPrefs = rawPrefs.map((entry: unknown) => {
                          if (typeof entry === "string") {
                            return { id: entry };
                          }
                          const obj = entry as { id?: string; _id?: string; name?: string; rollNo?: string };
                          return { id: obj.id || obj._id || "", name: obj.name, rollNo: obj.rollNo };
                        });
                        return (
                          <div
                            key={project.id}
                            className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <h4 className="font-medium text-sm mb-2 line-clamp-2">
                              {project.title}
                            </h4>
                            {studentPrefs.length > 0 ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                  <GraduationCap className="h-3 w-3" />
                                  {studentPrefs.length} student{studentPrefs.length !== 1 && "s"} ranked
                                </div>
                                <div className="max-h-28 overflow-y-auto space-y-1">
                                  {studentPrefs.map((s, index) => {
                                    const student = getStudent(s.id);
                                    const name = student.name !== "Unknown" ? student.name : s.name || "Unknown";
                                    const rollNo = student.rollNo !== "N/A" ? student.rollNo : s.rollNo || "N/A";
                                    return (
                                      <div
                                        key={`${s.id}-${index}`}
                                        className="flex items-center justify-between text-xs bg-background rounded px-2 py-1"
                                      >
                                        <span className="truncate flex-1">
                                          {name}
                                          <span className="text-muted-foreground ml-1">
                                            ({rollNo})
                                          </span>
                                        </span>
                                        <Badge variant="outline" className="ml-2 text-[10px] h-5">
                                          #{index + 1}
                                        </Badge>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                No students ranked yet
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No projects assigned</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessorPage;
