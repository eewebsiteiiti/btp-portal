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
import { ProfessorI } from "@/types";

const ProfessorPage = () => {
  const [professor, setProfessor] = useState<ProfessorI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchprofessor = async () => {
      try {
        const response = await fetch("/api/professor/get");
        if (!response.ok) throw new Error("Failed to fetch professor");
        const data = await response.json();
        setProfessor(data.professors);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchprofessor();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            📚 Professor Management
          </h1>
          <Link href="/admin" className="text-blue-500 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + Add Professor
        </Button>
      </div>

      {/* Loading and Error State */}
      {loading ? (
        <p className="text-center text-lg font-medium animate-pulse">
          Loading professors...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 text-lg">{error}</p>
      ) : (
        <Card className="p-6 shadow-md rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              {/* Table Header */}
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Faculty ID
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Name
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Email
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Projects
                  </TableHead>
                  <TableHead className="py-3 px-4 text-center font-semibold text-gray-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {professor && professor.length > 0 ? (
                  professor.map((prof, index) => (
                    <TableRow
                      key={prof._id}
                      className={`transition-all ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      {/* Faculty ID */}
                      <TableCell className="py-4 px-4 text-gray-800 font-medium">
                        {prof._id}
                      </TableCell>

                      {/* Name */}
                      <TableCell className="py-4 px-4 text-gray-800">
                        {prof.name}
                      </TableCell>

                      {/* Email */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {prof.email}
                      </TableCell>

                      {/* Projects */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {prof.projects && prof.projects.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1">
                            {prof.projects.map((p) => (
                              <li key={p} className="text-sm">
                                {p}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="italic text-gray-400">
                            No Projects
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-blue-400 hover:border-blue-500"
                          >
                            <Pencil
                              size={18}
                              className="text-blue-500 hover:text-blue-600"
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-red-400 hover:border-red-500"
                          >
                            <Trash
                              size={18}
                              className="text-red-500 hover:text-red-600"
                            />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-400"
                    >
                      No professors found.
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

export default ProfessorPage;
