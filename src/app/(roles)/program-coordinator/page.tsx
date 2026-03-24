"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  GraduationCap,
  FolderKanban,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function ProgramCoordinatorDashboard() {
  const { data: session } = useSession();
  const domain = session?.user?.domain || "";

  const [counts, setCounts] = useState({
    professors: 0,
    students: 0,
    projects: 0,
    nonDroppedCapacity: 0,
    drops: 0,
  });

  const [controls, setControls] = useState({
    projectViewEnableStudent: false,
    studentViewEnableProfessor: false,
    studentViewResult: false,
    professorViewResult: false,
  });

  const fetchCounts = async () => {
    if (!domain) return;
    try {
      const res = await fetch(`/api/data/count?program=MTP&domain=${domain}`);
      const data = await res.json();
      setCounts(data);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchControls = async () => {
    if (!domain) return;
    try {
      const res = await fetch(`/api/dpgc/submit-control?domain=${domain}`);
      const data = await res.json();
      setControls({
        projectViewEnableStudent: data.projectViewEnableStudent,
        studentViewEnableProfessor: data.studentViewEnableProfessor,
        studentViewResult: data.studentViewResult,
        professorViewResult: data.professorViewResult,
      });
    } catch (error) {
      console.error("Error fetching controls:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchControls();
  }, [domain]);

  const updateControl = async (type: string, enabled: boolean) => {
    try {
      await fetch("/api/dpgc/submit-control", {
        method: "POST",
        body: JSON.stringify({ type, enabled, domain }),
        headers: { "Content-Type": "application/json" },
      });
      setControls((prev) => ({ ...prev, [type]: enabled }));
      toast.success("Setting updated successfully");
    } catch (error) {
      console.error("Error updating control:", error);
      toast.error("Failed to update setting");
    }
  };

  const capacityStatus = counts.nonDroppedCapacity >= counts.students;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Program Coordinator Dashboard</h1>
        <p className="text-muted-foreground">
          MTP domain: <Badge variant="outline" className="ml-1 text-base">{domain}</Badge>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Professors</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.professors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.projects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {counts.drops} active | Capacity: {counts.nonDroppedCapacity}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {capacityStatus ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">
                  Capacity OK: {counts.nonDroppedCapacity} slots for {counts.students} students
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">
                  Capacity Warning: Only {counts.nonDroppedCapacity} slots for {counts.students} students
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Controls (PC can only toggle view-related settings) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Student View Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">View Projects</span>
              <Switch
                checked={controls.projectViewEnableStudent}
                onCheckedChange={(enabled) => updateControl("projectViewEnableStudent", enabled)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">View Results</span>
              <Switch
                checked={controls.studentViewResult}
                onCheckedChange={(enabled) => updateControl("studentViewResult", enabled)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Professor View Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">View Students</span>
              <Switch
                checked={controls.studentViewEnableProfessor}
                onCheckedChange={(enabled) => updateControl("studentViewEnableProfessor", enabled)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">View Results</span>
              <Switch
                checked={controls.professorViewResult}
                onCheckedChange={(enabled) => updateControl("professorViewResult", enabled)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
