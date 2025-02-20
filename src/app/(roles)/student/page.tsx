"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";

interface Project {
  id: string;
  title: string;
  domain: string;
  supervisor: string;
  cosupervisor?: string;
  description: string;
  capacity: number;
}

export default function StudentPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
console.log("projects", projects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/project/get");
        const data = await response.json();
        setProjects(data.projects);
      } catch {
        setError("Error fetching projects");
      }
    };
    fetchProjects();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setProjects((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id);
        const newIndex = prev.findIndex((p) => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const submitPreferences = async () => {
    if (!session?.user) return;
    try {
      const response = await fetch("/api/student/preference/put", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          preference: projects.map((p) => p.id),
        }),
      });
      if (!response.ok) throw new Error();
      alert("Preferences saved successfully!");
    } catch {
      setError("Error saving preferences");
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-100 h-screen w-full flex flex-col">
      <Card className="shadow-md rounded-lg p-3 bg-white">
        <CardContent>
          <h2 className="font-semibold text-gray-800">Student Information</h2>
          <p className="text-gray-600">Name: {session?.user?.name}</p>
          <p className="text-gray-600">Email: {session?.user?.email}</p>
          <LogoutButton />
        </CardContent>
      </Card>

      <h2 className="font-semibold text-gray-800">Order Your Preferred Projects</h2>
      {error && <p className="text-red-500 font-medium">{error}</p>}

      <ScrollArea className="flex-1 border rounded-md bg-white shadow-md p-2">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {projects.map((project) => (
                <SortableItem key={project.id} id={project.id} project={project} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>

      <div className="p-3 bg-white shadow-md rounded-md flex justify-between items-center">
        <p className="text-xs text-gray-600">Total Projects: {projects.length}</p>
        <Button onClick={submitPreferences} className="bg-green-500 text-white text-xs px-4 py-2 rounded-md hover:bg-green-600 transition-all">
          Submit
        </Button>
      </div>
    </div>
  );
}
