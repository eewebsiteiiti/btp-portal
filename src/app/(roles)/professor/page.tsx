"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoutButton from "@/components/LogoutButton";
import { ProjectI, StudentI, ProfessorI } from "@/types";
import { Badge } from "@/components/ui/badge";

// projectWiseStudentsData={
//   project_id:{
//     preference_of_student:{
//       group_no:[{roll_no,name,email}]
//     }
//   }
// }
interface projectWiseStudentsDataI {
  [key: string]: Record<string, StudentI[][]>;
}
const ProfessorPage = () => {
  const { data: session } = useSession();
  const [projectWiseStudentsData, setprojectWiseStudentsData] =
    useState<projectWiseStudentsDataI>({});
  const [professor, setProfessor] = useState<ProfessorI | null>(null);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchData = async () => {
      try {
        const res = await Promise.all([
          fetch("/api/professor/student/getbyprofessor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          }),
          fetch(`/api/professor/get?email=${session.user.email}`),
        ]);

        const [studentsRes, professorRes] = await Promise.all(
          res.map((r) => r.json())
        );

        setprojectWiseStudentsData(studentsRes.data || {});
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
  if (!professor)
    return (
      <p className="text-center mt-10 text-lg">No professor data found.</p>
    );

  return (
    <div className="space-y-4 p-4 bg-gray-100  w-full flex flex-col">
      {/* Professor Info */}
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">Professor Information</h2>
          <p>Name: {professor.name}</p>
          <p>Email: {professor.email}</p>
          <LogoutButton />
        </CardContent>
      </Card>

      {/* Projects & Students */}
      {projects.length > 0 && (
        <Tabs defaultValue={projects[0]._id} className="w-full">
          <TabsList className="flex overflow-x-auto border-b">
            {projects.map(({ _id, Project_No }) => (
              <TabsTrigger key={_id} value={_id}>
                {Project_No}
              </TabsTrigger>
            ))}
          </TabsList>

          {projects.map(({ _id, Title, Comments }) => (
            <TabsContent
              key={_id}
              value={_id}
              className="p-4 border rounded-md"
            >
              <h2 className="text-lg font-semibold">{Title}</h2>
              <p className="text-sm text-gray-500 mb-2">{Comments}</p>

              {/* Student List */}
              <ScrollArea className="border rounded-lg bg-gray-100  p-2 ">
                {projectWiseStudentsData[_id] &&
                  Object.values(projectWiseStudentsData[_id]).map(
                    (studentList, index) => (
                      <React.Fragment key={index}>
                        {studentList.map((group, groupKey) => (
                          <Card
                            key={groupKey}
                            className="p-4  shadow-md my-1 hover:bg-gray-50 shadow-sm"
                          >
                            <CardContent className="space-y-3">
                              {group.map(({ roll_no, name, email }) => (
                                <div key={roll_no} className="p-2">
                                  <div className="flex justify-between items-center">
                                    <h3 className="text-md font-semibold">
                                      {name} ({roll_no})
                                    </h3>
                                    <Badge variant="secondary">
                                      Preference #{index + 1}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    Email: {email}
                                  </p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </React.Fragment>
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
