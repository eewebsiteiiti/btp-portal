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
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ProfessorI, ProjectI } from "@/types";

const ProfessorPage = () => {
  const [professor, setProfessor] = useState<ProfessorI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<ProjectI[]>([]);
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
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/project/get");
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        setError((error as Error).message);
      }
    };
    fetchProjects();
    fetchprofessor();
  }, []);

  // Helper function to get project title from ID
  const getProjectTitle = (projectId: string) => {
    const project = projects.find((p) => p._id === projectId);
    return project ? project.Title : "Unknown Project";
  };

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
                  {/* <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Faculty ID
                  </TableHead> */}
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Name
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Email
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Projects
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Submit Status
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
                            {prof.projects.map((p, i) => (
                              <li key={i} className="text-sm">
                                {getProjectTitle(p)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="italic text-gray-400">
                            No Projects
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* {prof.submitStatus ? "Submitted" : "Pending"} */}
                        {prof.submitStatus ? (
                          <span className="text-green-500">Submitted</span>
                        ) : (
                          <span className="text-red-500">Pending</span>
                        )}
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
