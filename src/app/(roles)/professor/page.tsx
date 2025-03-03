"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import { ProfessorI, ProjectI, StudentI } from "@/types";

const ProfessorDashboard = () => {
  const { data: session } = useSession();
  const [professor, setProfessor] = useState<ProfessorI | null>(null);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [projectWiseStudents, setProjectWiseStudents] = useState<
    Record<string, { pref: number; studentGroup: StudentI[] }[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchData = async () => {
      try {
        const [studentsRes, professorRes] = await Promise.all([
          fetch("/api/professor/student/getbyprofessor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          }).then((res) => res.json()),
          fetch(`/api/professor/get?email=${session.user.email}`).then((res) =>
            res.json()
          ),
        ]);

        const formattedData = Object.entries(studentsRes.data || {}).reduce(
          (acc, [projectId, prefs]) => {
            acc[projectId] = Object.entries(
              prefs as Record<string, Record<string, StudentI[]>>
            ).flatMap(([pref, orders]) =>
              Object.values(orders).map((group) => ({
                pref: Number(pref),
                studentGroup: group,
              }))
            );
            return acc;
          },
          {} as Record<string, { pref: number; studentGroup: StudentI[] }[]>
        );

        setProjectWiseStudents(formattedData);
        console.log(formattedData);

        setProjects(studentsRes.projectDetails || []);
        setProfessor(professorRes.professor);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (loading) return <p className="text-center mt-10 text-lg">Loading...</p>;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen w-full flex flex-col">
      {/* Professor Info */}
      <Card className="w-full shadow-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold">Professor Information</h2>
          <p className="text-lg">{professor?.name}</p>
          <p className="text-gray-500">{professor?.email}</p>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </CardContent>
      </Card>

      {/* Project Tabs */}
      {projects.length > 0 ? (
        <Tabs defaultValue={projects[0]._id}>
          <TabsList className="flex border-b">
            {projects.map(({ _id, Project_No }) => (
              <TabsTrigger key={_id} value={_id}>
                {Project_No}
              </TabsTrigger>
            ))}
          </TabsList>

          {projects.map((project) => (
            <TabsContent
              key={project._id}
              value={project._id}
              className="p-6 border rounded-lg shadow-md bg-white"
            >
              <h2 className="text-xl font-semibold mb-2">{project.Title}</h2>
              <p className="text-gray-500 mb-4">{project.Comments}</p>

              {projectWiseStudents[project._id]?.length > 0 ? (
                projectWiseStudents[project._id].map(
                  ({ studentGroup, pref }, index) => (
                    <Card
                      key={index}
                      className="p-4 my-2 shadow-sm hover:bg-gray-100"
                    >
                      <CardContent>
                        {studentGroup.map(({ name, roll_no, email }, idx) => (
                          <div key={idx}>
                            <h3 className="text-lg font-medium">{name}</h3>
                            <p className="text-sm text-gray-500">
                              Email: {email}
                            </p>
                            <p className="text-sm text-gray-500">
                              Roll Number: {roll_no}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                      <CardDescription className="text-sm font-bold mt-2">
                        Preference #{pref + 1}
                      </CardDescription>
                    </Card>
                  )
                )
              ) : (
                <p className="text-gray-500">
                  No students have selected this project yet.
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p className="text-center text-gray-500">No projects available.</p>
      )}
    </div>
  );
};

export default ProfessorDashboard;
