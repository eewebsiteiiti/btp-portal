"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Table, TableBody, TableCell, TableHeader, TableHead, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ProjectI } from "@/types";
import Loading from "@/components/Loading";

const PCProjectsPage = () => {
  const { data: session } = useSession();
  const domain = session?.user?.domain || "";
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domain) return;
    const fetchProjects = async () => {
      try {
        const res = await fetch(`/api/project/get?program=MTP&domain=${domain}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProjects(data.projects);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [domain]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects ({domain})</h1>
        <p className="text-muted-foreground">View MTP projects in your domain</p>
      </div>

      {loading ? <Loading message="Loading projects..." /> : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold">Project No</TableHead>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Capacity</TableHead>
                  <TableHead className="font-semibold">Nature of Work</TableHead>
                  <TableHead className="font-semibold">Supervisor</TableHead>
                  <TableHead className="font-semibold">Co-Supervisor</TableHead>
                  <TableHead className="font-semibold">Dropped</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length > 0 ? projects.map((project, index) => (
                  <TableRow key={project.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <TableCell>{project.projectNo}</TableCell>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>{project.capacity}</TableCell>
                    <TableCell className="text-gray-600">{project.natureOfWork || "—"}</TableCell>
                    <TableCell className="text-gray-600">{project.supervisor}</TableCell>
                    <TableCell className="text-gray-600">{project.cosupervisor || "—"}</TableCell>
                    <TableCell>{project.dropProject ? <span className="text-destructive">Yes</span> : "No"}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-gray-400">No projects found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PCProjectsPage;
