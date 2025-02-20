"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";

interface SortableItemProps {
  id: string;
  project: {
    id: string;
    title: string;
    domain: string;
    supervisor: string;
    cosupervisor?: string;
    description: string;
    capacity: number;
  };
}

export default function SortableItem({ id, project }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing p-3 rounded-md border bg-white shadow-md transition-all duration-200"
    >
      <h3 className="text-sm font-medium text-gray-900">{project.title}</h3>
      <p className="text-xs text-gray-500">Supervisor: {project.supervisor}</p>
      {project.cosupervisor && (
        <p className="text-xs text-gray-500">Co-Supervisor: {project.cosupervisor}</p>
      )}
      <p className="text-xs text-gray-500 truncate">{project.description}</p>
      <p className="text-xs text-gray-500">Capacity: {project.capacity}</p>
    </Card>
  );
}
