"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { SortableItemProps } from "@/types";


export default function SortableItem({
  id,
  project,
  index,
  isOverlay,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

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
      className={`cursor-grab active:cursor-grabbing p-3 rounded-md border bg-white shadow-md transition-all duration-200 ${
        isOverlay ? "opacity-50 scale-105" : ""
      } flex items-center`}
    >
      <div className="mr-3 font-semibold text-gray-700">{index}.</div>
      <div>
        <h3 className="text-sm font-medium text-gray-900">{project.Title}</h3>
        <p className="text-xs text-gray-500">
          Supervisor: {project.Supervisor}
        </p>
        {project.Cosupervisor && (
          <p className="text-xs text-gray-500">
            Co-Supervisor: {project.Cosupervisor}
          </p>
        )}
        {/* <p className="text-xs text-gray-500 truncate">{project.description}</p> */}
        <p className="text-xs text-gray-500">Capacity: {project.Capacity}</p>
      </div>
    </Card>
  );
}
