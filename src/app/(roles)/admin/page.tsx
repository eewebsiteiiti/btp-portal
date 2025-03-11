"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    professors: 0,
    students: 0,
    projects: 0,
  });

  const [controls, setControls] = useState({
    submitEnableStudentProjects: false,
    submitEnableProfessorStudents: false,
    projectViewEnableStudent: false,
    studentViewEnableProfessor: false,
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
        headers: {
          "Content-Type": "application/json",
        },
      });
      // Update state immediately after successful response
      setControls((prev) => ({
        ...prev,
        [type]: enabled,
      }));
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
      fetchCounts(); // Refresh data after reset
    } catch (error) {
      console.error("Error resetting project allocation:", error);
      alert("Failed to reset project allocation.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-bold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Professors Count */}
        <div className="p-6 bg-secondary text-primary rounded-lg shadow-md">
          <span className="text-xl font-semibold">Professors</span>
          <span className="block text-2xl font-bold">{counts.professors}</span>
          <div className="flex items-center gap-2 mt-4">
            <Switch
              checked={controls.submitEnableProfessorStudents}
              onCheckedChange={(enabled) =>
                updateControl("submitEnableProfessorStudents", enabled)
              }
            />
            <span>Enable Professor Submission</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Switch
              checked={controls.studentViewEnableProfessor}
              onCheckedChange={(enabled) =>
                updateControl("studentViewEnableProfessor", enabled)
              }
            />
            <span>Enable View of Students for Professors</span>
          </div>
        </div>

        {/* Students Count */}
        <div className="p-6 bg-secondary text-primary rounded-lg shadow-md">
          <span className="text-xl font-semibold">Students</span>
          <span className="block text-2xl font-bold">{counts.students}</span>
          <div className="flex items-center gap-2 mt-4">
            <Switch
              checked={controls.submitEnableStudentProjects}
              onCheckedChange={(enabled) =>
                updateControl("submitEnableStudentProjects", enabled)
              }
            />
            <span>Enable Student Submission</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Switch
              checked={controls.projectViewEnableStudent}
              onCheckedChange={(enabled) =>
                updateControl("projectViewEnableStudent", enabled)
              }
            />
            <span>Enable View of Projects for Students</span>
          </div>
        </div>

        {/* Projects Count */}
        <div className="p-6 bg-secondary text-primary rounded-lg shadow-md">
          <span className="text-xl font-semibold">Projects</span>
          <span className="block text-2xl font-bold">{counts.projects}</span>
        </div>
      </div>

      {/* Start and Reset Allocation Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleStartAllocation}
          disabled={isAllocating || isResetting}
          className="mt-6"
        >
          {isAllocating ? "Starting Allocation..." : "Start Project Allocation"}
        </Button>
        <Button
          onClick={handleResetAllocation}
          disabled={isAllocating || isResetting}
          className="mt-6 bg-red-500 hover:bg-red-600"
        >
          {isResetting ? "Resetting..." : "Reset Allotment"}
        </Button>
      </div>
    </div>
  );
}
