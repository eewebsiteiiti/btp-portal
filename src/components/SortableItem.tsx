"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { SortableItemProps } from "@/types";

export default function SortableItem({ id, project, index, isOverlay }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

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
      className={`cursor-grab active:cursor-grabbing p-4 rounded-xl border shadow-sm transition-all duration-200 
        bg-background border-border ${isOverlay ? "opacity-50 scale-105" : ""} flex items-center gap-4`}
    >
      <div className="text-sm font-semibold text-muted-foreground">{index}.</div>
      <div className="flex flex-col">
        <h3 className="text-base font-medium text-foreground">{project.Title}</h3>
        <p className="text-xs text-muted-foreground">Supervisor: {project.Supervisor}</p>
        {project.Cosupervisor && (
          <p className="text-xs text-muted-foreground">Co-Supervisor: {project.Cosupervisor}</p>
        )}
        <p className="text-xs text-muted-foreground truncate">{project.Comments}</p>
        <p className="text-xs text-muted-foreground truncate">Domain: {project.Domain}</p>
        <p className="text-xs text-muted-foreground truncate">Project No: {project.Project_No}</p>
        <p className="text-xs text-muted-foreground truncate">
          Nature of Work: {project.Nature_of_work.length > 100 ? `${project.Nature_of_work.substring(0, 100)}...` : project.Nature_of_work}
        </p>
        <p className="text-xs text-muted-foreground">Capacity: {project.Capacity}</p>
      </div>
    </Card>
  );
}
