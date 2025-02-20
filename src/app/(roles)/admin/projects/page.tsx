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
import { Pencil, Trash } from "lucide-react"; // Icons for action buttons
import { Card } from "@/components/ui/card"; // Wrapping table in a card UI
import Link from "next/link";
import { ProjectI } from "@/types";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchprojects = async () => {
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

    fetchprojects();
  }, []);

  return (
    <div className="p-6">
      <Link href="/admin" className="text-blue-600">
        Dashboard
      </Link>{" "}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📚 Project Management
      </h1>
      {loading ? (
        <p className="text-center text-lg font-medium">Loading projects...</p>
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
                    Domain
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Poject_No
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Title
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Capacity
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Nature_of_work
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Comments{" "}
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Supervisor{" "}
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Cosupervisor
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700 text-center">
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
                      <TableCell className="py-2 text-gray-800 font-medium">
                        {project.Project_No}
                      </TableCell>
                      <TableCell className="py-2 text-gray-800">
                        {project.Title}
                      </TableCell>
                      <TableCell className="py-2 text-gray-600">
                        {project.Capacity}
                      </TableCell>
                      <TableCell className="py-2 text-gray-600">
                        {project.Nature_of_work}
                      </TableCell>
                      <TableCell className="py-2 text-gray-600">
                        {project.Comments}
                      </TableCell>
                      <TableCell className="py-2 text-gray-600">
                        {project.Supervisor}
                      </TableCell>
                      <TableCell className="py-2 text-gray-600">
                        {project.Cosupervisor}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <Button variant="outline" size="icon" className="mr-2">
                          <Pencil size={18} className="text-blue-600" />
                        </Button>
                        <Button variant="outline" size="icon" className="mr-2">
                          <Trash size={18} className="text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
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
