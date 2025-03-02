"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StudentI } from "@/types";
import { Badge } from "@/components/ui/badge";

interface SortableStudentGroupProps {
  group: StudentI[];
  index: number;
}

const SortableStudentGroup: React.FC<SortableStudentGroupProps> = ({
  group,
  index,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: group[0].roll_no });

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
      className="p-4 shadow-md my-1 hover:bg-gray-50 shadow-sm cursor-pointer"
    >
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-semibold">Group #{index + 1}</h3>
          <Badge variant="secondary">Preference #{index + 1}</Badge>
        </div>
        {group.map(({ roll_no, name, email }) => (
          <div
            key={roll_no}
            className="p-2 border rounded-md bg-white shadow-sm"
          >
            <h4 className="font-medium">
              {name} ({roll_no})
            </h4>
            <p className="text-sm text-gray-500">Email: {email}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SortableStudentGroup;
