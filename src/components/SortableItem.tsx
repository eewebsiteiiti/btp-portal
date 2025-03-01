"use client";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { SortableItemProps } from "@/types";
import { Button } from "./ui/button";

export default function SortableItem({
  id,
  project,
  index,
  isOverlay,
  setProjectMap,
  projectMap,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const [rollNumber, setRollNumber] = useState("");
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isOverlay ? "none" : transition || "transform 0.2s ease",
  };
  const handleRollNumberAdd = () => {
    // projectMap[project._id] = { partnerRollNumber: rollNumber, status: "Pending" };
    setProjectMap((project_map) => ({
      ...project_map,
      [project._id]: { partnerRollNumber: rollNumber, status: "Pending" },
    }));
    setRollNumber("");
  };

  const handleDisable = () => {
    return false; //developemtn
    if (rollNumber === "") {
      return false;
    }
    if (rollNumber.length === 9) {
      return false;
    } else {
      return true;
    }
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
              {project.Title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Supervisor: {project.Supervisor}
            </p>
            {project.Cosupervisor && (
              <p className="text-xs text-muted-foreground">
                Co-Supervisor: {project.Cosupervisor}
              </p>
            )}
            <p className="text-xs text-muted-foreground truncate">
              {project.Comments}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Domain: {project.Domain}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Project No: {project.Project_No}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Nature of Work:{" "}
              {project.Nature_of_work.length > 100
                ? `${project.Nature_of_work.substring(0, 100)}...`
                : project.Nature_of_work}
            </p>
            {/* <Button onClick={()=>setProjectMap()}>submit</Button> */}
            <p className="text-xs text-muted-foreground">
              Capacity: {project.Capacity}
            </p>

            {project.Capacity == 2 &&
            projectMap[id].partnerRollNumber !== "" ? (
              <>
                <p className="text-sm">
                  {" "}
                  Partner&apos;s Roll Number: {projectMap[id].partnerRollNumber}
                  <span
                    className={`italic ${
                      projectMap[project._id]?.status === "Pending"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {" "}
                    ({projectMap[project._id]?.status})
                  </span>
                </p>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {project.Capacity == 2 ? (
            <>
              <input
                type="text"
                placeholder="Enter partner's roll number"
                className="border p-2 rounded-md w-full"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />

              <Button onClick={handleRollNumberAdd} disabled={handleDisable()}>
                {projectMap[project._id]?.partnerRollNumber === ""
                  ? "Add"
                  : "Remove/Update"}
              </Button>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </Card>
  );
}
