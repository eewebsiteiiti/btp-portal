"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  GraduationCap,
  FolderKanban,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

type ConfirmDialogState = {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  variant: "default" | "destructive";
  onConfirm: () => void;
};

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
    minCapacity: 3,
    maxCapacity: 4,
  });

  const [isAllocating, setIsAllocating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDevFilling, setIsDevFilling] = useState(false);
  const [isClearingPreferences, setIsClearingPreferences] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "default",
    onConfirm: () => {},
  });

  const closeDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const showConfirmDialog = (config: Omit<ConfirmDialogState, "open">) => {
    setConfirmDialog({ ...config, open: true });
  };

  const fetchCounts = async () => {
    try {
      const res = await fetch("/api/data/count");
      const updatedData = await res.json();
      setCounts(updatedData);
    } catch (error) {
      console.error("Error fetching updated counts:", error);
      toast.error("Failed to fetch counts");
    }
  };

  const fetchAdminControls = async () => {
    try {
      const res = await fetch("/api/admin/submit-control");
      const data = await res.json();
      setControls(data);
    } catch (error) {
      console.error("Error fetching admin controls:", error);
      toast.error("Failed to fetch admin controls");
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchAdminControls();
  }, []);

  const updateControl = async (type: string, enabled: boolean | number) => {
    try {
      await fetch("/api/admin/submit-control", {
        method: "POST",
        body: JSON.stringify({ type, enabled }),
        headers: { "Content-Type": "application/json" },
      });
      setControls((prev) => ({ ...prev, [type]: enabled }));
      toast.success(`Setting updated successfully`);
    } catch (error) {
      console.error("Error updating admin controls:", error);
      toast.error("Failed to update setting");
    }
  };

  const handleStartAllocation = () => {
    showConfirmDialog({
      title: "Start Project Allocation",
      description: "Are you sure you want to start the project allocation? This will assign students to projects based on their preferences.",
      confirmText: "Start Allocation",
      variant: "default",
      onConfirm: async () => {
        closeDialog();
        setIsAllocating(true);
        try {
          const res = await fetch("/api/admin/projectallotment");
          if (!res.ok) throw new Error("Failed to start allocation");
          toast.success("Project allocation completed successfully!");
        } catch (error) {
          console.error("Error starting project allocation:", error);
          toast.error("Failed to start project allocation");
        } finally {
          setIsAllocating(false);
        }
      },
    });
  };

  const handleResetAllocation = () => {
    showConfirmDialog({
      title: "Reset Allocation",
      description: "Are you sure you want to reset the allocation? This will remove all current project assignments.",
      confirmText: "Reset Allocation",
      variant: "destructive",
      onConfirm: async () => {
        closeDialog();
        setIsResetting(true);
        try {
          const res = await fetch("/api/admin/resetallotment");
          if (!res.ok) throw new Error("Failed to reset allocation");
          toast.success("Project allocation reset successfully!");
          fetchCounts();
        } catch (error) {
          console.error("Error resetting project allocation:", error);
          toast.error("Failed to reset project allocation");
        } finally {
          setIsResetting(false);
        }
      },
    });
  };

  const handleDevFill = async () => {
    setIsDevFilling(true);
    try {
      const res = await fetch("/api/admin/test1");
      if (!res.ok) throw new Error("Failed to auto-fill");
      toast.success("Done filling student preferences");
      fetchCounts();
    } catch (error) {
      console.error("Error in dev-fill:", error);
      toast.error("Failed to auto-fill student preferences");
    } finally {
      setIsDevFilling(false);
    }
  };

  const handleClearPreferences = () => {
    showConfirmDialog({
      title: "Clear All Preferences",
      description: "Are you sure you want to clear ALL student and professor preferences? This will reset all submitted preferences and set everyone's submit status back to pending.",
      confirmText: "Clear Preferences",
      variant: "destructive",
      onConfirm: async () => {
        closeDialog();
        setIsClearingPreferences(true);
        try {
          const res = await fetch("/api/admin/clear-preferences", {
            method: "POST",
          });
          if (!res.ok) throw new Error("Failed to clear preferences");
          toast.success("All preferences cleared successfully!");
          fetchCounts();
        } catch (error) {
          console.error("Error clearing preferences:", error);
          toast.error("Failed to clear preferences");
        } finally {
          setIsClearingPreferences(false);
        }
      },
    });
  };

  const clearProfessors = () => {
    showConfirmDialog({
      title: "Delete All Professors",
      description: "Are you sure you want to delete ALL professors? This action cannot be undone.",
      confirmText: "Delete All",
      variant: "destructive",
      onConfirm: async () => {
        closeDialog();
        try {
          await fetch("/api/professor/delete", { method: "DELETE" });
          toast.success("All professors deleted successfully");
          fetchCounts();
        } catch (error) {
          console.error("Error deleting professors:", error);
          toast.error("Failed to delete professors");
        }
      },
    });
  };

  const clearStudents = () => {
    showConfirmDialog({
      title: "Delete All Students",
      description: "Are you sure you want to delete ALL students? This action cannot be undone.",
      confirmText: "Delete All",
      variant: "destructive",
      onConfirm: async () => {
        closeDialog();
        try {
          await fetch("/api/student/delete", { method: "DELETE" });
          toast.success("All students deleted successfully");
          fetchCounts();
        } catch (error) {
          console.error("Error deleting students:", error);
          toast.error("Failed to delete students");
        }
      },
    });
  };

  const clearProjects = () => {
    showConfirmDialog({
      title: "Delete All Projects",
      description: "Are you sure you want to delete ALL projects? This action cannot be undone.",
      confirmText: "Delete All",
      variant: "destructive",
      onConfirm: async () => {
        closeDialog();
        try {
          await fetch("/api/project/delete", { method: "DELETE" });
          toast.success("All projects deleted successfully");
          fetchCounts();
        } catch (error) {
          console.error("Error deleting projects:", error);
          toast.error("Failed to delete projects");
        }
      },
    });
  };

  const handleClearDatabase = () => {
    showConfirmDialog({
      title: "Clear Entire Database",
      description: "WARNING: Are you sure you want to clear the ENTIRE database? This will delete ALL students, professors, projects, and allocations. This action CANNOT be undone!",
      confirmText: "Clear Everything",
      variant: "destructive",
      onConfirm: async () => {
        closeDialog();
        try {
          const res = await fetch("/api/admin/clear-database", {
            method: "POST",
          });
          if (!res.ok) throw new Error("Failed to clear database");
          toast.success("Database cleared successfully!");
          fetchCounts();
          fetchAdminControls();
        } catch (error) {
          console.error("Error clearing database:", error);
          toast.error("Failed to clear database");
        }
      },
    });
  };

  const capacityStatus = counts.nonDroppedCapacity >= counts.students;

  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />

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
              {counts.drops} active | Total capacity: {counts.nonDroppedCapacity}
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
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="minCapacity" className="text-sm">Min Capacity</Label>
                <Input
                  id="minCapacity"
                  type="number"
                  value={controls.minCapacity}
                  onChange={(e) =>
                    updateControl("minCapacity", parseInt(e.target.value) || 0)
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="maxCapacity" className="text-sm">Max Capacity</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={controls.maxCapacity}
                  onChange={(e) =>
                    updateControl("maxCapacity", parseInt(e.target.value) || 0)
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <Separator />
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
            <Button
              variant="outline"
              onClick={handleClearPreferences}
              disabled={isClearingPreferences}
            >
              {isClearingPreferences ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                "Clear Preferences"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
