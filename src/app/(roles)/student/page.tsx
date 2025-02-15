"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton";

interface Project {
  id: string;
  title: string;
  professor: string;
  coSupervisor: string;
  description: string;
  minPeople: number;
}

const projects: Project[] = Array.from({ length: 70 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Project ${i + 1}`,
  professor: `Professor ${Math.ceil(Math.random() * 10)}`,
  coSupervisor: `Co-Supervisor ${Math.ceil(Math.random() * 5)}`,
  description: `Description for Project ${i + 1}`,
  minPeople: Math.ceil(Math.random() * 5) + 1,
}));

export default function StudentPage() {
  const { data: session } = useSession();
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (selectedProjects.length > 30) {
      setSelectedProjects((prev) => prev.slice(0, 30));
    }
  }, [selectedProjects]);

  const toggleProjectSelection = (project: Project) => {
    setSelectedProjects((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === project.id);
      if (existingIndex !== -1) {
        return prev.filter((p) => p.id !== project.id);
      }
      if (prev.length < 30) {
        return [...prev, project];
      }
      return prev;
    });
  };

  const submitPreferences = async () => {
    if (!session?.user) return;
    const response = await fetch("/api/save-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: session.user.email,
        preferences: selectedProjects.map((p, index) => ({ projectId: p.id, preferenceOrder: index + 1 })),
      }),
    });
    if (response.ok) {
      alert("Preferences saved successfully!");
    } else {
      alert("Error saving preferences");
    }
  };

  return (
    <div className="p-6 space-y-4 h-screen w-full flex flex-col">
      {/* Student Info */}
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">Student Information</h2>
          <p>Name: {session?.user?.name}</p>
          <p>Email: {session?.user?.email}</p>
          <LogoutButton />
        </CardContent>
      </Card>

      {/* Project Selection */}
      <h2 className="text-lg font-semibold">Select Your 30 Preferred Projects (Order Matters)</h2>
      <ScrollArea className="flex-1 border rounded-md p-2 w-full overflow-y-auto">
        <div className="space-y-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              onClick={() => toggleProjectSelection(project)}
              className={`cursor-pointer p-4 w-full ${
                selectedProjects.find((p) => p.id === project.id) ? "border-blue-500" : ""
              }`}
            >
              <CardContent>
                <h3 className="text-lg font-medium">{project.title}</h3>
                <p className="text-sm text-gray-500">Supervisor: {project.professor}</p>
                <p className="text-sm text-gray-500">Co-Supervisor: {project.coSupervisor}</p>
                <p className="text-sm text-gray-500">{project.description}</p>
                <p className="text-sm text-gray-500">Min People: {project.minPeople}</p>
                {selectedProjects.find((p) => p.id === project.id) && (
                  <p className="text-sm font-bold">Preference #{selectedProjects.findIndex((p) => p.id === project.id) + 1}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 bg-white shadow-md w-full flex justify-between items-center">
        <p className="text-gray-500">Selected: {selectedProjects.length}/30</p>
        <Button disabled={selectedProjects.length !== 30} onClick={submitPreferences}>Submit Preferences</Button>
      </div>
    </div>
  );
}
