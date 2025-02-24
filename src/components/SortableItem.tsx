"use client";

import { useSortable } from "@dnd-kit/sortable";
import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { SortableItemProps } from "@/types";
import { Button } from "./ui/button";

export default function SortableItem({ id, project, index, isOverlay }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [roll, setRoll] = useState("");
  const [isRoll, setIsRoll] = useState(false);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isOverlay ? "none" : transition || "transform 0.2s ease",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing justify-between p-4 rounded-xl border shadow-sm transition-all duration-200
        bg-background border-border ${isOverlay ? "opacity-50 scale-105" : ""} flex items-center gap-4`}
    >
      <div className="flex items-center justify-center gap-4">
        <div className="text-sm font-semibold text-muted-foreground">{index}.</div>
        <div className="flex flex-col">
          <h3 className="text-base font-medium text-foreground">{project.Title}</h3>
          <p className="text-xs text-muted-foreground">Supervisor: {project.Supervisor}</p>
          {project.Cosupervisor && (
            <p className="text-xs text-muted-foreground">Co-Supervisor: {project.Cosupervisor}</p>
          )}
          <p className="text-xs text-muted-foreground truncate w-64">{project.Comments}</p>
          <p className="text-xs text-muted-foreground truncate w-64">Domain: {project.Domain}</p>
          <p className="text-xs text-red-500 truncate w-64">Project No: {project.Project_No}</p>
          <p className="text-xs text-muted-foreground truncate w-64">Nature of Work: {project.Nature_of_work}</p>
          <p className="text-xs text-muted-foreground">Capacity: {project.Capacity}</p>
          {isRoll && <p className="text-sm text-blue-800">Partner's Roll: {roll}</p>}
        </div>
      </div>
      {Number(project.Capacity) > 1 ? <>

        <div className="flex items-center gap-4 justify-between">
          <form>
            <input
              type="text"
              onChange={(e) => setRoll(e.target.value)}
              value={roll}
              placeholder="Partner's roll number"
              className="w-full p-1 border-2 border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-black-500 transition"
            />
          </form>
          <Button className="ml-auto p-4" size="sm" disabled={roll.length!==9} onClick={()=>{setIsRoll(true)}}>Add a partner</Button>
        </div>

      </> : <></>}
    </Card>
  );
}
