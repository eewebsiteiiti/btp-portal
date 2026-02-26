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
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProjectI } from "@/types";
import Loading from "@/components/Loading";
import { toast } from "sonner";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "destructive" as "default" | "destructive",
    onConfirm: () => {},
  });

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCapacityChange = async (project: ProjectI, newCapacity: number) => {
    if (project.capacity === 2 && newCapacity === 1) {
      setConfirmDialog({
        open: true,
        title: "Reduce Capacity",
        description: `Reducing capacity from 2 to 1 for "${project.title}" will break all existing group pairings for this project. Are you sure?`,
        confirmText: "Reduce Capacity",
        variant: "destructive",
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          await updateCapacity(project.id, newCapacity);
        },
      });
    } else {
      await updateCapacity(project.id, newCapacity);
    }
  };

  const updateCapacity = async (projectId: string, newCapacity: number) => {
    try {
      const res = await fetch("/api/project/update/capacity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, capacity: newCapacity }),
      });
      if (!res.ok) throw new Error("Failed to update capacity");
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, capacity: newCapacity } : p))
      );
      toast.success(`Capacity updated to ${newCapacity}`);
    } catch (error) {
      console.error("Error updating capacity:", error);
      toast.error("Failed to update capacity");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            📚 Project Management
          </h1>
        </div>
      </div>

      {/* Loading and Error State */}
      {loading ? (
        <Loading message="Loading Projects..." />
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
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                    Dropped
                  </TableHead>
                  {/* <TableHead className="py-3 px-4 text-center font-semibold text-gray-600">
                    Actions
                  </TableHead> */}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {projects && projects.length > 0 ? (
                  projects.map((project, index) => (
                    <TableRow
                      key={project.id}
                      className={`transition-all ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      {/* Domain */}
                      <TableCell className="py-4 px-4 text-gray-800 font-medium">
                        {project.domain || "—"}
                      </TableCell>

                      {/* Project No */}
                      <TableCell className="py-4 px-4 text-gray-800">
                        {project.projectNo || "—"}
                      </TableCell>

                      {/* Title */}
                      <TableCell className="py-4 px-4 text-gray-800">
                        {project.title || "—"}
                      </TableCell>

                      {/* Capacity */}
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant={project.capacity === 1 ? "default" : "outline"}
                            className="h-7 w-7 p-0"
                            onClick={() => handleCapacityChange(project, 1)}
                            disabled={project.capacity === 1}
                          >
                            1
                          </Button>
                          <Button
                            size="sm"
                            variant={project.capacity === 2 ? "default" : "outline"}
                            className="h-7 w-7 p-0"
                            onClick={() => handleCapacityChange(project, 2)}
                            disabled={project.capacity === 2}
                          >
                            2
                          </Button>
                        </div>
                      </TableCell>

                      {/* Nature of Work */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.natureOfWork || "—"}
                      </TableCell>

                      {/* Comments */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.comments || "—"}
                      </TableCell>

                      {/* Supervisor */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.supervisor || "—"}
                      </TableCell>

                      {/* Co-Supervisor */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.cosupervisor || "—"}
                      </TableCell>

                      {/* Project-Drop */}
                      <TableCell className="py-4 px-4 text-gray-600">
                        {project.dropProject ? (
                          <span className="text-destructive">Yes</span>
                        ) : (
                          "No"
                        )}
                      </TableCell>

                      {/* Actions */}
                      {/* <TableCell className="py-4 px-4 text-center">
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
                      </TableCell> */}
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
