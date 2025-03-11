"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { StudentI } from "@/types";

const StudentsPage = () => {
  const [students, setStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/student/get");
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data.students);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="p-6">
      <Link href="/admin" className="text-blue-600 hover:underline">
        Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📚 Student Management
      </h1>

      {loading ? (
        <p className="text-center text-lg font-medium">Loading students...</p>
      ) : error ? (
        <p className="text-red-500 text-center text-lg">{error}</p>
      ) : (
        <Card className="p-4 shadow-lg rounded-xl">
          <div className="overflow-x-auto">
            <Table className="w-full border border-gray-200 rounded-lg">
              {/* Table Header */}
              <TableHeader className="sticky top-0 bg-gray-200">
                <TableRow>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Roll No
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Name
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Email
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <TableRow
                      key={student.roll_no}
                      className={`transition-all ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      <TableCell className="py-2 text-gray-800 font-medium">
                        {student.roll_no}
                      </TableCell>
                      <TableCell className="py-2 text-gray-800">
                        {student.name}
                      </TableCell>
                      <TableCell className="py-2 text-gray-600">
                        {student.email}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <Button variant="outline" size="icon" className="mr-2">
                          <Pencil size={18} className="text-blue-600" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash size={18} className="text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-gray-500"
                    >
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentsPage;
