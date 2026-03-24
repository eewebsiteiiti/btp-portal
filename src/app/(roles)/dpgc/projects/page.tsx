"use client";

import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHeader, TableHead, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProjectI } from "@/types";
import Loading from "@/components/Loading";
import { toast } from "sonner";

const DOMAINS = ["ALL", "CSP", "PSPE", "VDN"];

const MtpProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState("ALL");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false, title: "", description: "", confirmText: "Confirm",
    variant: "destructive" as "default" | "destructive", onConfirm: () => {},
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const domainParam = activeDomain !== "ALL" ? `&domain=${activeDomain}` : "";
      const response = await fetch(`/api/project/get?program=MTP${domainParam}`);
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [activeDomain]);

  const handleCapacityChange = async (project: ProjectI, newCapacity: number) => {
    if (project.capacity === 2 && newCapacity === 1) {
      setConfirmDialog({
        open: true, title: "Reduce Capacity",
        description: `Reducing capacity from 2 to 1 for "${project.title}" will break existing group pairings.`,
        confirmText: "Reduce Capacity", variant: "destructive",
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
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, capacity: newCapacity }),
      });
      if (!res.ok) throw new Error();
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, capacity: newCapacity } : p)));
      toast.success(`Capacity updated to ${newCapacity}`);
    } catch { toast.error("Failed to update capacity"); }
  };

  return (
    <div className="p-6 space-y-8">
      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))} title={confirmDialog.title} description={confirmDialog.description} confirmText={confirmDialog.confirmText} onConfirm={confirmDialog.onConfirm} variant={confirmDialog.variant} />

      <div>
        <h1 className="text-3xl font-bold">MTP Projects</h1>
        <p className="text-muted-foreground">Manage MTP project data</p>
      </div>

      <Tabs value={activeDomain} onValueChange={setActiveDomain}>
        <TabsList>{DOMAINS.map((d) => (<TabsTrigger key={d} value={d}>{d}</TabsTrigger>))}</TabsList>
      </Tabs>

      {loading ? <Loading message="Loading MTP Projects..." /> : error ? (
        <p className="text-center text-red-500 text-lg">{error}</p>
      ) : (
        <Card className="p-6 shadow-md rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">Domain</TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">Project No</TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">Title</TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">Capacity</TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">Nature of Work</TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">Supervisor</TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">Co-Supervisor</TableHead>
                  <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">Dropped</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length > 0 ? projects.map((project, index) => (
                  <TableRow key={project.id} className={`transition-all ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}>
                    <TableCell className="py-4 px-4 text-gray-800 font-medium">{project.domain || "—"}</TableCell>
                    <TableCell className="py-4 px-4 text-gray-800">{project.projectNo || "—"}</TableCell>
                    <TableCell className="py-4 px-4 text-gray-800">{project.title || "—"}</TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant={project.capacity === 1 ? "default" : "outline"} className="h-7 w-7 p-0" onClick={() => handleCapacityChange(project, 1)} disabled={project.capacity === 1}>1</Button>
                        <Button size="sm" variant={project.capacity === 2 ? "default" : "outline"} className="h-7 w-7 p-0" onClick={() => handleCapacityChange(project, 2)} disabled={project.capacity === 2}>2</Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-gray-600">{project.natureOfWork || "—"}</TableCell>
                    <TableCell className="py-4 px-4 text-gray-600">{project.supervisor || "—"}</TableCell>
                    <TableCell className="py-4 px-4 text-gray-600">{project.cosupervisor || "—"}</TableCell>
                    <TableCell className="py-4 px-4 text-gray-600">{project.dropProject ? <span className="text-destructive">Yes</span> : "No"}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={8} className="text-center py-6 text-gray-400">No MTP projects found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MtpProjectsPage;
