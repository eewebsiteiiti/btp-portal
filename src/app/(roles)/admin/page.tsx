"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  GraduationCap,
  FolderKanban,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    professors: 0,
    students: 0,
    projects: 0,
    nonDroppedCapacity: 0,
    drops: 0,
  });

  const [controls, setControls] = useState({
    submitEnableStudentProjects: false,
    submitEnableProfessorStudents: false,
    projectViewEnableStudent: false,
    studentViewEnableProfessor: false,
    studentViewResult: false,
    professorViewResult: false,
  });

  const [isAllocating, setIsAllocating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDevFilling, setIsDevFilling] = useState(false);

  const fetchCounts = async () => {
    try {
      const res = await fetch("/api/data/count");
      const updatedData = await res.json();
      setCounts(updatedData);
    } catch (error) {
      console.error("Error fetching updated counts:", error);
    }
  };

  const fetchAdminControls = async () => {
    try {
      const res = await fetch("/api/admin/submit-control");
      const data = await res.json();
      setControls(data);
    } catch (error) {
      console.error("Error fetching admin controls:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchAdminControls();
  }, []);

  const updateControl = async (type: string, enabled: boolean) => {
    try {
      await fetch("/api/admin/submit-control", {
        method: "POST",
        body: JSON.stringify({ type, enabled }),
        headers: { "Content-Type": "application/json" },
      });
      setControls((prev) => ({ ...prev, [type]: enabled }));
    } catch (error) {
      console.error("Error updating admin controls:", error);
    }
  };

  const handleStartAllocation = async () => {
    if (!window.confirm("Are you sure you want to start the project allocation? This will assign students to projects based on preferences.")) {
      return;
    }
    setIsAllocating(true);
    try {
      const res = await fetch("/api/admin/projectallotment");
      if (!res.ok) throw new Error("Failed to start allocation");
      alert("Project allocation completed successfully!");
    } catch (error) {
      console.error("Error starting project allocation:", error);
      alert("Failed to start project allocation.");
    } finally {
      setIsAllocating(false);
    }
  };

  const handleResetAllocation = async () => {
    if (!window.confirm("Are you sure you want to reset the allocation? This will remove all current project assignments.")) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/resetallotment");
      if (!res.ok) throw new Error("Failed to reset allocation");
      alert("Project allocation reset successfully!");
      fetchCounts();
    } catch (error) {
      console.error("Error resetting project allocation:", error);
      alert("Failed to reset project allocation.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDevFill = async () => {
    setIsDevFilling(true);
    try {
      const res = await fetch("/api/admin/test1");
      if (!res.ok) throw new Error("Failed to auto-fill");
      alert("Done filling student preferences.");
      fetchCounts();
    } catch (error) {
      console.error("Error in dev-fill:", error);
      alert("Failed to auto-fill student preferences.");
    } finally {
      setIsDevFilling(false);
    }
  };

  const clearProfessors = async () => {
    if (!window.confirm("Are you sure you want to delete ALL professors? This action cannot be undone.")) {
      return;
    }
    try {
      await fetch("/api/professor/delete", { method: "DELETE" });
      fetchCounts();
    } catch (error) {
      console.error("Error deleting professors:", error);
    }
  };

  const clearStudents = async () => {
    if (!window.confirm("Are you sure you want to delete ALL students? This action cannot be undone.")) {
      return;
    }
    try {
      await fetch("/api/student/delete", { method: "DELETE" });
      fetchCounts();
    } catch (error) {
      console.error("Error deleting students:", error);
    }
  };

  const clearProjects = async () => {
    if (!window.confirm("Are you sure you want to delete ALL projects? This action cannot be undone.")) {
      return;
    }
    try {
      await fetch("/api/project/delete", { method: "DELETE" });
      fetchCounts();
    } catch (error) {
      console.error("Error deleting projects:", error);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm("⚠️ WARNING: Are you sure you want to clear the ENTIRE database? This will delete ALL students, professors, projects, and allocations. This action CANNOT be undone!")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/clear-database", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to clear database");
      alert("Database cleared successfully!");
      fetchCounts();
      fetchAdminControls();
    } catch (error) {
      console.error("Error clearing database:", error);
      alert("Failed to clear database.");
    }
  };

  const capacityStatus = counts.nonDroppedCapacity >= counts.students;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Manage the BTP allocation process</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Professors Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Professors
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.professors}</div>
          </CardContent>
        </Card>

        {/* Students Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students
            </CardTitle>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.students}</div>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projects
            </CardTitle>
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.projects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {counts.drops} active • Total capacity: {counts.nonDroppedCapacity}
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
                  Capacity OK: {counts.nonDroppedCapacity} slots available for {counts.students} students
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

      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Student Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">View Projects</span>
              <Switch
                checked={controls.projectViewEnableStudent}
                onCheckedChange={(enabled) =>
                  updateControl("projectViewEnableStudent", enabled)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Submit Preferences</span>
              <Switch
                checked={controls.submitEnableStudentProjects}
                onCheckedChange={(enabled) =>
                  updateControl("submitEnableStudentProjects", enabled)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">View Results</span>
              <Switch
                checked={controls.studentViewResult}
                onCheckedChange={(enabled) =>
                  updateControl("studentViewResult", enabled)
                }
              />
            </div>
            <Separator />
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={clearStudents}
            >
              Clear All Students
            </Button>
          </CardContent>
        </Card>

        {/* Professor Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Professor Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">View Students</span>
              <Switch
                checked={controls.studentViewEnableProfessor}
                onCheckedChange={(enabled) =>
                  updateControl("studentViewEnableProfessor", enabled)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Submit Preferences</span>
              <Switch
                checked={controls.submitEnableProfessorStudents}
                onCheckedChange={(enabled) =>
                  updateControl("submitEnableProfessorStudents", enabled)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">View Results</span>
              <Switch
                checked={controls.professorViewResult}
                onCheckedChange={(enabled) =>
                  updateControl("professorViewResult", enabled)
                }
              />
            </div>
            <Separator />
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={clearProfessors}
            >
              Clear All Professors
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Projects Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Project Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearProjects}
          >
            Clear All Projects
          </Button>
        </CardContent>
      </Card>

      {/* Allocation Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Allocation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleStartAllocation}
              disabled={isAllocating || isResetting}
            >
              {isAllocating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Allocating...
                </>
              ) : (
                "Start Allocation"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleResetAllocation}
              disabled={isAllocating || isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Allocation"
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearDatabase}
            >
              Clear Entire Database
            </Button>
            <Button
              variant="secondary"
              onClick={handleDevFill}
              disabled={isDevFilling}
            >
              {isDevFilling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Filling...
                </>
              ) : (
                "Dev-Fill"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
