import { StudentI } from "@/types";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";

const StudentHeader = ({ student }: { student: StudentI }) => {
  return (
    <Card className="shadow-md rounded-lg p-3 bg-white">
      <CardContent>
        <h2 className="font-semibold text-gray-800">Student Information</h2>
        <p className="text-gray-600">Name: {student?.name}</p>
        <p className="text-gray-600">Email: {student?.email}</p>
        <p className="text-gray-600">Roll Number: {student?.roll_no}</p>

        <LogoutButton />
      </CardContent>
    </Card>
  );
};

export default StudentHeader;
