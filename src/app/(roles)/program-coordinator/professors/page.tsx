"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProfessorI, StudentI } from "@/types";
import Loading from "@/components/Loading";
import {
  Users, Mail, FolderKanban, CheckCircle, Clock, Search, GraduationCap,
} from "lucide-react";

const PCProfessorsPage = () => {
  const { data: session } = useSession();
  const domain = session?.user?.domain || "";
  const [professors, setProfessors] = useState<ProfessorI[]>([]);
  const [students, setStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!domain) return;
    const fetchData = async () => {
      try {
        const [profRes, studRes] = await Promise.all([
          fetch(`/api/professor/get?program=MTP&domain=${domain}`),
          fetch(`/api/student/get?program=MTP&domain=${domain}`),
        ]);
        if (!profRes.ok || !studRes.ok) throw new Error("Failed to fetch");
        const [profData, studData] = await Promise.all([profRes.json(), studRes.json()]);
        setProfessors(profData.professors);
        setStudents(studData.students);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [domain]);

  const getStudent = (id: string) => {
    const s = students.find((s) => s.id === id);
    return { name: s?.name || "Unknown", rollNo: s?.rollNo || "N/A" };
  };

  const filtered = professors.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Professors ({domain})</h1>
        <p className="text-muted-foreground">View professors with MTP projects in your domain</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search professors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {loading ? <Loading message="Loading professors..." /> : error ? (
        <Card className="p-6"><p className="text-center text-red-500">{error}</p></Card>
      ) : filtered.length === 0 ? (
        <Card className="p-6"><p className="text-center text-muted-foreground">No professors found.</p></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((prof) => {
            const mtpProjects = (prof.projects || []).filter((p) => p.program === "MTP" && p.domain === domain);
            return (
              <Card key={prof.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                      <div>
                        <CardTitle className="text-lg">{prof.name}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-3 w-3" />{prof.email}</div>
                      </div>
                    </div>
                    <Badge variant={prof.mtpSubmitStatus ? "default" : "secondary"}>
                      {prof.mtpSubmitStatus ? <><CheckCircle className="h-3 w-3 mr-1" />Submitted</> : <><Clock className="h-3 w-3 mr-1" />Pending</>}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {mtpProjects.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><FolderKanban className="h-4 w-4" />Projects ({mtpProjects.length})</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {mtpProjects.map((project) => {
                          const rawPrefs = (prof.mtpStudentsPreference?.[project.id] || []).flat();
                          const studentPrefs = rawPrefs.map((entry: unknown) => {
                            if (typeof entry === "string") return { id: entry };
                            const obj = entry as { id?: string; _id?: string; name?: string; rollNo?: string };
                            return { id: obj.id || obj._id || "", name: obj.name, rollNo: obj.rollNo };
                          });
                          return (
                            <div key={project.id} className={`border rounded-lg p-3 ${project.dropProject ? "bg-red-50 border-red-200" : "bg-muted/30"}`}>
                              <h4 className="font-medium text-sm mb-2">{project.title}</h4>
                              {studentPrefs.length > 0 ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><GraduationCap className="h-3 w-3" />{studentPrefs.length} student{studentPrefs.length !== 1 && "s"} ranked</div>
                                  <div className="max-h-28 overflow-y-auto space-y-1">
                                    {studentPrefs.map((s, i) => {
                                      const student = getStudent(s.id);
                                      return (
                                        <div key={`${s.id}-${i}`} className="flex items-center justify-between text-xs bg-background rounded px-2 py-1">
                                          <span className="truncate flex-1">{student.name !== "Unknown" ? student.name : s.name || "Unknown"} <span className="text-muted-foreground">({student.rollNo !== "N/A" ? student.rollNo : s.rollNo || "N/A"})</span></span>
                                          <Badge variant="outline" className="ml-2 text-[10px] h-5">#{i + 1}</Badge>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : <p className="text-xs text-muted-foreground">No students ranked</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No MTP projects in this domain</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PCProfessorsPage;
