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
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StudentI } from "@/types";
import * as XLSX from "xlsx";
import Loading from "@/components/Loading";

const StudentsPage = () => {
  const [students, setStudents] = useState<StudentI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projectIdNumberMap, setProjectIdNumberMap] = useState<{
    [key: string]: number;
  }>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/project/get");
        const data = await response.json();
        const tempMap: { [key: string]: number } = {};
        for (const proj of data.projects) {
          tempMap[proj._id] = proj.Project_No;
        }
        setProjectIdNumberMap(tempMap);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchProjects();
    fetchStudents();
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newExpandedRows = new Set(prev);
      if (newExpandedRows.has(id)) {
        newExpandedRows.delete(id);
      } else {
        newExpandedRows.add(id);
      }
      return newExpandedRows;
    });
  };

  // Export to Excel
  const handleExportToExcel = () => {
    const formattedData = students.map((student) => ({
      Roll_No: student.roll_no,
      Name: student.name,
      Email: student.email,
      Top_3_Preferences: student.preferences
        .slice(0, 3)
        .map(
          (pref, index) =>
            `${index + 1}. Project No: ${
              projectIdNumberMap[pref.project] || "N/A"
            } ${pref.isGroup ? `(Group)` : `(Solo)`}`
        )
        .join(", "),
      All_Preferences: student.preferences
        .map(
          (pref, index) =>
            `${index + 1}. Project No: ${
              projectIdNumberMap[pref.project] || "N/A"
            } ${pref.isGroup ? `(Group)` : `(Solo)`}`
        )
        .join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // Generate and trigger download
    XLSX.writeFile(workbook, "StudentData.xlsx");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📚 Student Management
      </h1>

      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleExportToExcel}
          className="bg-green-600 text-white"
        >
          Export to Excel
        </Button>
      </div>

      {loading ? (
        // <p className="text-center text-lg font-medium">Loading students...</p>
        <Loading message="Loading students..." />
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
                  <TableHead className="font-bold py-3 text-gray-700">
                    Top Preferences
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700 ">
                    Submit Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <>
                      <TableRow
                        key={student._id}
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
                        <TableCell className="py-2 text-gray-600">
                          {student.preferences.slice(0, 3).map((pref, key) => (
                            <div key={pref.project} className="mb-1">
                              {key + 1}. Project No:{" "}
                              {projectIdNumberMap[pref.project] || "N/A"}{" "}
                              {pref.isGroup ? `(Group)` : `(Solo)`}
                            </div>
                          ))}
                          {student.preferences.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(student._id)}
                              className="mt-2 text-blue-600"
                            >
                              {expandedRows.has(student._id) ? (
                                <>
                                  Hide All <ChevronUp size={16} />
                                </>
                              ) : (
                                <>
                                  Show All {student.preferences.length}{" "}
                                  <ChevronDown size={16} />
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.submitStatus ? (
                            <span className="text-green-500">Submitted</span>
                          ) : (
                            <span className="text-red-500">Pending</span>
                          )}{" "}
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedRows.has(student._id) && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-100 p-4">
                            <div className="grid grid-cols-2 gap-4">
                              {student.preferences.map((pref, key) => (
                                <div key={pref.project} className="border p-3">
                                  <p>
                                    <strong>Preference {key + 1}</strong>
                                  </p>
                                  <p>
                                    Project No:{" "}
                                    {projectIdNumberMap[pref.project] || "N/A"}
                                  </p>
                                  <p>
                                    {pref.isGroup
                                      ? `Partner: ${pref.partnerRollNumber}`
                                      : "Solo"}
                                  </p>
                                  <p>
                                    {pref.isGroup ? (
                                      <>
                                        Status:
                                        {pref.status === "Success" ? (
                                          <span className="text-green-500">
                                            Success
                                          </span>
                                        ) : (
                                          <span className="text-red-500">
                                            Pending
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
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
