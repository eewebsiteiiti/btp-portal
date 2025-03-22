"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import { ProfessorI, ProjectI, StudentI } from "@/types";
import Loading from "@/components/Loading";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SortableItemPP } from "@/components/SortableItemPP";
import { ControlsI } from "@/types";
import ProfessorResult from "@/components/ProfessorPage/ProfessorResult";

const ProfessorDashboard = () => {
  const { data: session } = useSession();
  const [professor, setProfessor] = useState<ProfessorI | null>(null);
  const [controls, setControls] = useState<ControlsI>();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [dropProject, setDropProject] = useState<Record<string, boolean>>({});
  const [projectWiseStudents, setProjectWiseStudents] = useState<
    Record<string, { pref: number; studentGroup: StudentI[] }[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [activeProjectCount, setActiveProjectCount] = useState(0);

  useEffect(() => {
    // for( const profProject of profProject.project)
    // const project = projects.find((project) => project._id === projects[0]._id);
    // setActiveProjectCount(activeProjectCount + (project ? project.Capacity : 0));
    // console.log(activeProjectCount);
    projects.map((project) => {
      console.log()
      setActiveProjectCount(activeProjectCount + project?.Capacity);
    }
    )
    console.log(activeProjectCount);
  }

    , [projects]);

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
          (acc, [projectId, prefs]) => ({
            ...acc,
            [projectId]: Object.entries(
              prefs as Record<string, Record<string, StudentI[]>>
            ).flatMap(([pref, orders]) =>
              Object.values(orders).map((group) => ({
                pref: Number(pref),
                studentGroup: group,
              }))
            ),
          }),
          {} as Record<string, { pref: number; studentGroup: StudentI[] }[]>
        );

        setProjectWiseStudents(formattedData);
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

  useEffect(() => {
    const fetchAdminControls = async () => {
      try {
        const res = await fetch("/api/admin/submit-control");
        const data = await res.json();
        setControls(data);
      } catch (error) {
        console.error("Error fetching admin controls:", error);
      }
    };

    fetchAdminControls();
  }, []);

  const handleSwitchChange = (projectId: string) => {
    setDropProject((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
    if (!dropProject[projectId]) {
      setActiveProjectCount(activeProjectCount + (projects.find((project) => project._id === projectId)?.Capacity ?? 0));
    }
    else {
      setActiveProjectCount(activeProjectCount - (projects.find((project) => project._id === projectId)?.Capacity ?? 0));
    }
    console.log(activeProjectCount);
  };
  const handleDragEnd = (event: DragEndEvent, projectId: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setProjectWiseStudents((prev) => {
        const updatedStudents = [...prev[projectId]];
        const oldIndex = updatedStudents.findIndex(
          (item) => item.studentGroup[0]._id === active.id
        );
        const newIndex = updatedStudents.findIndex(
          (item) => item.studentGroup[0]._id === over?.id
        );
        const newOrder = arrayMove(updatedStudents, oldIndex, newIndex);

        return {
          ...prev,
          [projectId]: newOrder,
        };
      });
    }
  };

  const handleSubmit = async () => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to save the changes? This will update the student order."
    );
    if (!confirmSubmit) return;

    try {
      await fetch("/api/professor/student/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: projectWiseStudents,
          professor: professor?._id,
          submitStatus: true,
        }),
      });
      alert("Student order updated successfully!");
    } catch (error) {
      console.error("Error updating student order:", error);
      alert("Failed to update student order.");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 w-full flex flex-col">
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
      {controls?.professorViewResult ? (
        <ProfessorResult professor_name={professor?.name || ""} />
      ) : (
        <>
          {controls?.studentViewEnableProfessor ? (
            <>
              {/* Project Tabs */}
              {projects.length > 0 ? (
                <Tabs defaultValue={projects[0]._id} className="">
                  <TabsList className="flex border-b">
                    {projects.map(({ _id, Project_No }) => (
                      <TabsTrigger
                        key={_id}
                        value={_id}
                        className="text-md mx-2"
                      >
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
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-xl font-semibold mb-2">
                            {project.Title}
                          </h2>
                          <p className="text-gray-500 mb-4">{project.Comments}</p>
                        </div>
                        <div className="flex items-center gap-4 ">
                          <Switch
                            checked={dropProject[project._id]}
                            onCheckedChange={() => handleSwitchChange(project._id)}
                          />
                          <Label htmlFor="">Switch this project off</Label>
                        </div>
                      </div>
                      {dropProject[project._id] ? (<>
                        Project has been considered drop</>) : (<> <ScrollArea className="flex-1 border rounded-md bg-white shadow-md p-2">
                          {projectWiseStudents[project._id]?.length > 0 ? (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) =>
                                handleDragEnd(event, project._id)
                              }
                            >
                              <SortableContext
                                items={projectWiseStudents[project._id].map(
                                  (item) => item.studentGroup[0]._id
                                )}
                                strategy={verticalListSortingStrategy}
                              >
                                {projectWiseStudents[project._id].map(
                                  ({ studentGroup, pref }) => (
                                    <SortableItemPP
                                      key={studentGroup[0]._id}
                                      id={studentGroup[0]._id}
                                    >
                                      <Card className="p-4 my-4 shadow-sm hover:bg-gray-100">
                                        <CardContent>
                                          <div>
                                            {studentGroup.map(
                                              ({ name, roll_no, email }) => (
                                                <div key={roll_no}>
                                                  <h3 className="text-lg font-medium">
                                                    {name}
                                                  </h3>
                                                  <p className="text-sm text-gray-500">
                                                    Email: {email}
                                                  </p>
                                                  <p className="text-sm text-gray-500">
                                                    Roll Number: {roll_no}
                                                  </p>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </CardContent>
                                        <CardDescription className="text-sm font-bold mt-2 text-blue-600">
                                          Preference #{pref + 1}
                                        </CardDescription>
                                      </Card>
                                    </SortableItemPP>
                                  )
                                )}
                              </SortableContext>
                            </DndContext>
                          ) : (
                            <p className="text-gray-500">
                              No students have selected this project yet.
                            </p>
                          )}
                          <button
                            onClick={handleSubmit}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Save Changes
                          </button>
                        </ScrollArea></>)}

                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <p className="text-center text-gray-500">
                  No projects available.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-center items-center h-40 border rounded-md bg-white shadow-md">
                <p className="text-gray-500 font-medium">
                  Allotment process yet to be started
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProfessorDashboard;
