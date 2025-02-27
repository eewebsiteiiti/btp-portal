"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Professor {
  name: string;
  email: string;
  projects: { _id: string; title: string; domain: string }[];
}

interface ProjectWiseStudents {
  [projectId: string]: {
    [rank: number]: Set<string>;
  };
}

export default function ProfessorPage() {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [projectWiseStudents, setProjectWiseStudents] = useState<ProjectWiseStudents | null>(null);

  useEffect(() => {
    async function fetchData() {
      const email = "professor@example.com"; // Change this dynamically
      const response = await fetch("/api/professor", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) return;

      const data = await response.json();
      setProfessor(data.professor);

      // Convert arrays back to Sets
      const reconstructedData = Object.fromEntries(
        Object.entries(data.projectWiseStudents).map(([projectId, preferences]) => [
          projectId,
          Object.fromEntries(
            Object.entries(preferences).map(([rank, studentArray]) => [
              Number(rank),
              new Set(studentArray),
            ])
          ),
        ])
      );

      setProjectWiseStudents(reconstructedData);
    }

    fetchData();
  }, []);

  if (!professor) return <p className="text-center mt-10 text-lg">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Professor Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Professor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Name:</strong> {professor.name}</p>
          <p><strong>Email:</strong> {professor.email}</p>
        </CardContent>
      </Card>

      {/* Tabs for Projects */}
      <Tabs defaultValue={professor.projects[0]?._id} className="w-full">
        <TabsList className="mb-4">
          {professor.projects.map((project) => (
            <TabsTrigger key={project._id} value={project._id}>
              {project.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {professor.projects.map((project) => (
          <TabsContent key={project._id} value={project._id}>
            <Card>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <p className="text-sm text-gray-500">Domain: {project.domain}</p>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preference Rank</TableHead>
                      <TableHead>Student(s)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectWiseStudents?.[project._id] ? (
                      Object.entries(projectWiseStudents[project._id])
                        .sort(([rankA], [rankB]) => Number(rankA) - Number(rankB)) // Sort by preference rank
                        .map(([rank, studentSet]) => (
                          <TableRow key={rank}>
                            <TableCell>{rank}</TableCell>
                            <TableCell>
                              {[...studentSet].map((group, index) => (
                                <Badge key={index} className="mr-2">{group}</Badge>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          No student preferences found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}