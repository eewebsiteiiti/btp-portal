"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

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
    setIsAllocating(true);
    try {
      const res = await fetch("/api/admin/projectallotment");
      if (!res.ok) throw new Error("Failed to start allocation");
      alert("Project allocation started successfully!");
    } catch (error) {
      console.error("Error starting project allocation:", error);
      alert("Failed to start project allocation.");
    } finally {
      setIsAllocating(false);
    }
  };

  const handleResetAllocation = async () => {
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

  const handleAutoAllocation = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/test1");
      if (!res.ok) throw new Error("Failed to auto-allocate");
      alert("Done filling student preferences.");
      fetchCounts();
    } catch (error) {
      console.error("Error in auto-allocation:", error);
      alert("Failed to auto-allocate.");
    } finally {
      setIsResetting(false);
    }
  };

  const clearProfessor = async () => {
    try {
      await fetch("/api/professor/delete", { method: "DELETE" });
      fetchCounts();
    } catch (error) {
      console.error("Error deleting professors:", error);
    }
  };

  const clearStudents = async () => {
    try {
      await fetch("/api/student/delete", { method: "DELETE" });
      fetchCounts();
    } catch (error) {
      console.error("Error deleting students:", error);
    }
  };

  const clearProjects = async () => {
    try {
      await fetch("/api/project/delete", { method: "DELETE" });
      fetchCounts();
    } catch (error) {
      console.error("Error deleting projects:", error);
    }
  };

  const handleClearDatabase = async () => {
    if (confirm("Are you sure you want to clear the entire database?")) {
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
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-bold">Admin Dashboard</h2>

      {/* Stats and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Professors */}
        <div className="p-6 bg-secondary text-primary rounded-lg shadow-md space-y-4 flex flex-col">
          <div>
            <span className="text-xl font-semibold">Professors</span>
            <span className="block text-2xl font-bold">
              {counts.professors}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={controls.submitEnableProfessorStudents}
                onCheckedChange={(enabled) =>
                  updateControl("submitEnableProfessorStudents", enabled)
                }
              />
              <span>Enable Professor Submission</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={controls.studentViewEnableProfessor}
                onCheckedChange={(enabled) =>
                  updateControl("studentViewEnableProfessor", enabled)
                }
              />
              <span>Enable View of Students for Professors</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={controls.professorViewResult}
                onCheckedChange={(enabled) =>
                  updateControl("professorViewResult", enabled)
                }
              />
              <span>Enable Result for Professors</span>
            </div>
            <div className="flex items-left gap-2 flex-col">
              <p> Number of Dropped Projects: {counts.drops}</p>
              <p>
                {" "}
                Max capacity of all active projects: {counts.nonDroppedCapacity}
              </p>
              <p>
                {counts.nonDroppedCapacity < counts.students ? (
                  <span className="text-red-500">
                    Logic Violation! Capacity is less than students
                  </span>
                ) : (
                  <span className="text-green-500">
                    No Logic Violation! Capacity is greater than equal to
                    students
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="mt-auto flex justify-end">
            <Button variant="destructive" onClick={clearProfessor}>
              Clear Professors
            </Button>
          </div>
        </div>

        {/* Students */}
        <div className="p-6 bg-secondary text-primary rounded-lg shadow-md space-y-4 flex flex-col">
          <div>
            <span className="text-xl font-semibold">Students</span>
            <span className="block text-2xl font-bold">{counts.students}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={controls.submitEnableStudentProjects}
                onCheckedChange={(enabled) =>
                  updateControl("submitEnableStudentProjects", enabled)
                }
              />
              <span>Enable Student Submission</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={controls.projectViewEnableStudent}
                onCheckedChange={(enabled) =>
                  updateControl("projectViewEnableStudent", enabled)
                }
              />
              <span>Enable View of Projects for Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={controls.studentViewResult}
                onCheckedChange={(enabled) =>
                  updateControl("studentViewResult", enabled)
                }
              />
              <span>Enable Result for Students</span>
            </div>
          </div>
          <div className="mt-auto flex justify-end">
            <Button variant="destructive" onClick={clearStudents}>
              Clear Students
            </Button>
          </div>
        </div>

        {/* Projects */}
        <div className="p-6 bg-secondary text-primary rounded-lg shadow-md space-y-4 flex flex-col">
          <div>
            <span className="text-xl font-semibold">Projects</span>
            <span className="block text-2xl font-bold">{counts.projects}</span>
          </div>
          <div className="mt-auto flex justify-end">
            <Button variant="destructive" onClick={clearProjects}>
              Clear Projects
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleStartAllocation}
          disabled={isAllocating || isResetting}
        >
          {isAllocating ? "Starting..." : "Start Allocation"}
        </Button>
        <Button
          onClick={handleResetAllocation}
          disabled={isAllocating || isResetting}
        >
          {isResetting ? "Resetting..." : "Reset Allocation"}
        </Button>
        <Button onClick={handleAutoAllocation}>Dev-Fill</Button>
        <Button onClick={handleClearDatabase}>Clear Database</Button>
      </div>
    </div>
  );
}
