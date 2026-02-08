"use client";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { SortableItemProps } from "@/types";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function SortableItem({
  id,
  project,
  index,
  isOverlay,
  setProjectMap,
  projectMap,
  student,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const [rollNumber, setRollNumber] = useState("");
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isOverlay ? "none" : transition || "transform 0.2s ease",
  };

  const handleRollNumberAdd = () => {
    if (/[a-zA-Z]/.test(rollNumber)) {
      toast.error("Please enter only the numeric roll number (e.g. 220003016)");
      return;
    }
    if (student.rollNo === rollNumber) {
      toast.error("You cannot add yourself as a partner");
      return;
    }
    setProjectMap((project_map) => ({
      ...project_map,
      [project.id]: { partnerRollNumber: rollNumber, status: "Pending" },
    }));
    setRollNumber("");
  };

  const handleDisable = () => {
    if (rollNumber === "") {
      return true;
    }
    if (rollNumber.length >= 6) {
      return false;
    }
    return true;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing p-4 rounded-xl border shadow-sm transition-all duration-200
        bg-background border-border ${
          isOverlay ? "opacity-50 scale-105" : ""
        } flex items-center gap-4`}
    >
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-muted-foreground">
            {index}.
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-medium text-foreground">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Supervisor: {project.supervisor}
            </p>
            {project.cosupervisor && (
              <p className="text-xs text-muted-foreground">
                Co-Supervisor: {project.cosupervisor}
              </p>
            )}
            <p className="text-xs text-muted-foreground truncate">
              {project.comments}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Domain: {project.domain}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Project No: {project.projectNo}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Nature of Work:{" "}
              {project.natureOfWork.length > 100
                ? `${project.natureOfWork.substring(0, 100)}...`
                : project.natureOfWork}
            </p>
            <p className="text-xs text-muted-foreground">
              Capacity: {project.capacity}
            </p>

            {project.capacity === 2 &&
            projectMap[id]?.partnerRollNumber !== "" ? (
              <>
                <p className="text-sm">
                  Partner&apos;s Roll Number: {projectMap[id]?.partnerRollNumber}
                  <span
                    className={`italic ${
                      projectMap[project.id]?.status === "Pending"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {" "}
                    ({projectMap[project.id]?.status})
                  </span>
                </p>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {project.capacity === 2 ? (
            <>
              <input
                type="text"
                placeholder="Enter partner's roll number"
                className="border p-2 rounded-md w-full"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />

              <Button onClick={handleRollNumberAdd} disabled={handleDisable()}>
                {projectMap[project.id]?.partnerRollNumber === ""
                  ? "Add"
                  : "Update"}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
