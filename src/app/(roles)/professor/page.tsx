"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoutButton from "@/components/LogoutButton";
import { ProjectI, StudentI, ProfessorI } from "@/types";

const ProfessorPage = () => {
  const { data: session } = useSession();
  const [allStudents, setAllStudents] = useState<
    Record<string, Record<string, StudentI[][]>>
  >({});
  const [allProjects, setAllProjects] = useState<ProjectI[]>([]);
  const [professor, setProfessor] = useState<ProfessorI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchProfessorAndStudents = async () => {
      try {
        const [studentsRes, professorRes] = await Promise.all([
          fetch("/api/professor/student/getbyprofessor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          }),
          fetch(`/api/professor/get?email=${session.user.email}`),
        ]);

        const [studentsData, professorData] = await Promise.all([
          studentsRes.json(),
          professorRes.json(),
        ]);

        setAllStudents(studentsData.data || {});
        setAllProjects(studentsData.projectDetails || []);
        setProfessor(professorData.professor);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessorAndStudents();
  }, [session]);

  if (loading) return <p className="text-center mt-10 text-lg">Loading...</p>;
  if (!professor)
    return (
      <p className="text-center mt-10 text-lg">No professor data found.</p>
    );

  return (
    <div className="space-y-4 p-4 bg-gray-100 h-screen w-full flex flex-col">
      {/* Professor Info */}
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">Professor Information</h2>
          <p>Name: {professor.name}</p>
          <p>Email: {professor.email}</p>
          <LogoutButton />
        </CardContent>
      </Card>

      {/* Tabs for Projects */}
      {allProjects.length > 0 && (
        <Tabs defaultValue={allProjects[0]._id} className="w-full">
          <TabsList className="flex overflow-x-auto border-b">
            {allProjects.map(({ _id, Project_No }) => (
              <TabsTrigger key={_id} value={_id}>
                {Project_No}
              </TabsTrigger>
            ))}
          </TabsList>

          {allProjects.map(({ _id, Title, Comments }) => (
            <TabsContent
              key={_id}
              value={_id}
              className="p-4 border rounded-md"
            >
              <h2 className="text-lg font-semibold">{Title}</h2>
              <p className="text-sm text-gray-500 mb-2">{Comments}</p>

              <ScrollArea className="flex-1 border rounded-md bg-white shadow-md p-2">
                {Object.values(allStudents[_id] || {}).map(
                  (studentList, index) => (
                    <div key={index} className="w-full">
                      {studentList.map((studentGroup, groupKey) => (
                        <div key={groupKey} className="p-3 w-full">
                          {studentGroup.map(({ roll_no, name, email }) => (
                            <Card key={roll_no} className="p-2 w-full">
                              <CardContent>
                                <h3 className="text-lg font-medium">
                                  {name} ({roll_no})
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Email: {email}
                                </p>
                                <p className="text-sm font-bold">
                                  Preference #{index + 1}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default ProfessorPage;
