"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoutButton from "@/components/LogoutButton";

const dummyProjects = Array.from({ length: 10 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Project ${String.fromCharCode(65 + i)}`,
  description: `Detailed research on topic ${String.fromCharCode(65 + i)}`,
  students: Array.from({ length: 15 }, (_, j) => ({
    roll_no: `S${i + 1}${j + 1}`,
    name: `Student ${i + 1}${j + 1}`,
    email: `student${i + 1}${j + 1}@example.com`,
    cpi: (Math.random() * 2 + 8).toFixed(2),
    preferenceOrder: j + 1,
  })),
}));

export default function ProfessorPage() {
  const [projects] = useState(dummyProjects);

  return (
    <div className="p-6 space-y-4 h-screen w-full flex flex-col">
      {/* Professor Info */}
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">Professor Information</h2>
          <p>Name: John Doe</p>
          <p>Email: john.doe@example.com</p>
          <LogoutButton />
        </CardContent>
      </Card>

      {/* Project Tabs */}
      <Tabs defaultValue={projects[0]?.id} className="w-full">
        <TabsList className="flex overflow-x-auto border-b">
          {projects.map((project) => (
            <TabsTrigger key={project.id} value={project.id}>
              {project.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {projects.map((project) => (
          <TabsContent key={project.id} value={project.id} className="p-4 border rounded-md">
            <h2 className="text-lg font-semibold">{project.title}</h2>
            <p className="text-sm text-gray-500 mb-2">{project.description}</p>
            {/* <ScrollArea className="border rounded-md p-2 w-full overflow-y-auto h-96"> */}
              <div className="space-y-4">
                {project.students
                  .sort((a, b) => a.preferenceOrder - b.preferenceOrder || b.cpi - a.cpi)
                  .map((student) => (
                    <Card key={student.roll_no} className="p-4 w-full">
                      <CardContent>
                        <h3 className="text-lg font-medium">{student.name} ({student.roll_no})</h3>
                        <p className="text-sm text-gray-500">Email: {student.email}</p>
                        <p className="text-sm text-gray-500">CPI: {student.cpi}</p>
                        <p className="text-sm font-bold">Preference #{student.preferenceOrder}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            {/* </ScrollArea> */}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
