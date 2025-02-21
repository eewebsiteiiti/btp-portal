"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";
import { ProjectI } from "@/types";

export default function StudentPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectI | null>(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (over && active.id !== over.id) {
      setProjects((prev) => {
        const oldIndex = prev.findIndex((p) => p._id === active.id);
        const newIndex = prev.findIndex((p) => p._id === over.id);
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
          preference: projects.map((p) => p._id),
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => {
            const project = projects.find((p) => p._id === event.active.id);
            setActiveProject(project || null);
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveProject(null)}
        >
          <SortableContext items={projects.map((p) => p._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {projects.map((project, index) => (
                <SortableItem key={project._id} id={project._id} project={project} index={index + 1} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeProject ? (
              <SortableItem id={activeProject._id} project={activeProject} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </ScrollArea>

      <div className="p-3 bg-white shadow-md rounded-md flex justify-between items-center">
        <p className="text-xs text-gray-600">Total Projects: {projects.length}</p>
        <Button
          onClick={submitPreferences}
          className="bg-green-500 text-white text-xs px-4 py-2 rounded-md hover:bg-green-600 transition-all"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
