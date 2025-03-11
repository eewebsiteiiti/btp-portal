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
import { ProjectI } from "@/types";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/project/get");
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            📚 Project Management
          </h1>
          <Link href="/admin" className="text-blue-500 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + Add Project
        </Button>
      </div>

      {/* Loading and Error State */}
      {loading ? (
        <p className="text-center text-lg font-medium animate-pulse">
          Loading projects...
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
                    Domain
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Project No
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Title
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Capacity
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Nature of Work
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Comments
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Supervisor
                  </TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Co-Supervisor
                  </TableHead>
                  <TableHead className="py-3 px-4 text-center font-semibold text-gray-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {projects && projects.length > 0 ? (
                  projects.map((project, index) => (
                    <TableRow
                      key={project._id}
                      className={`transition-all ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      {/* Domain */}
                      <TableCell className="py-4 px-4 text-gray-800 font-medium">
                        {project.Domain || "—"}
                      </TableCell>

                      {/* Project No */}
                      <TableCell className="py-4 px-4 text-gray-800">
                        {project.Project_No || "—"}
                      </TableCell>

                      {/* Title */}
                      <TableCell className="py-4 px-4 text-gray-800">
                        {project.Title || "—"}
                      </TableCell>

                      {/* Capacity */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.Capacity || "—"}
                      </TableCell>

                      {/* Nature of Work */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.Nature_of_work || "—"}
                      </TableCell>

                      {/* Comments */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.Comments || "—"}
                      </TableCell>

                      {/* Supervisor */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.Supervisor || "—"}
                      </TableCell>

                      {/* Co-Supervisor */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.Cosupervisor || "—"}
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
                      colSpan={9}
                      className="text-center py-6 text-gray-400"
                    >
                      No projects found.
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

export default ProjectsPage;
