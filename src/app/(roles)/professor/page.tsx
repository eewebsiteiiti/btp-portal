"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoutButton from "@/components/LogoutButton";
import { ProjectI } from "@/types";

const ProfessorPage = () => {
  const { data: session } = useSession();
  const [allStudents, setAllStudents] = useState([]);
  const [allProjects, setAllProjects] = useState<ProjectI[]>([]);
  const [professor, setProfessor] = useState();
  useEffect(() => {
    const fetchAllStudents = async () => {
      if (!session?.user?.email) return;
      console.log(session.user.email);

      const response = await fetch("api/professor/student/getbyprofessor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      });
      const data = await response.json();
      setAllStudents(data.data);
      setAllProjects(data.projectDetails);
    };
    fetchAllStudents();
  }, [session]);
  useEffect(() => {
    const fetchProfessor = async () => {
      if (!session?.user?.email) return;

      const response = await fetch(
        `api/professor/get?email=${session?.user?.email}`
      );
      const data = await response.json();
      setProfessor(data.professor);
    };
    fetchProfessor();
  }, [session]);

  if (!professor)
    return <p className="text-center mt-10 text-lg">Loading...</p>;

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
      {/* Tabs for Projects */}
      {allProjects.length !== 0 ? (
        <>
          <Tabs defaultValue={allProjects[0]._id} className="w-full">
            <TabsList className="flex overflow-x-auto border-b">
              {allProjects &&
                allProjects.map((project) => (
                  <TabsTrigger key={project._id} value={project._id}>
                    {project.Project_No}
                  </TabsTrigger>
                ))}
            </TabsList>
            {allProjects.map((project) => (
              <TabsContent
                key={project._id}
                value={project._id}
                className="p-4 border rounded-md"
              >
                <h2 className="text-lg font-semibold">{project.Title}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  {project.Nature_of_work}
                </p>
                <ScrollArea className="flex-1 border rounded-md bg-white shadow-md p-2">
                  <div className="space-y-4">
                    {Object.keys(allStudents).map(
                      (prooject) =>
                        prooject === project._id &&
                        Object.keys(allStudents[prooject]).map(
                          (students, index) => (
                            <>
                              {allStudents[prooject][students].map(
                                (students) => (
                                  <>
                                    <Card className="p-4 w-full">
                                      {students.map((student) => (
                                        <>
                                          {console.log(index)}
                                          <Card
                                            key={student.roll_no}
                                            className="p-4 w-full"
                                          >
                                            <CardContent>
                                              <h3 className="text-lg font-medium">
                                                {student.name} (
                                                {student.roll_no})
                                              </h3>
                                              <p className="text-sm text-gray-500">
                                                Email: {student.email}
                                              </p>
                                              <p className="text-sm font-bold">
                                                Preference #{index + 1}
                                              </p>
                                            </CardContent>
                                          </Card>
                                        </>
                                      ))}
                                    </Card>
                                  </>
                                )
                              )}
                            </>
                          )
                        )
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ProfessorPage;
