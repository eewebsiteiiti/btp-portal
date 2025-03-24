"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import { ProfessorI, ProjectI, StudentI } from "@/types";
import Loading from "@/components/Loading";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { SortableItemPP } from "@/components/SortableItemPP";
import { ControlsI } from "@/types";
import ProfessorResult from "@/components/ProfessorPage/ProfessorResult";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [error, setError] = useState(false);

  // Calculate max capacity whenever projects change
  useEffect(() => {
    const totalCapacity = projects.reduce(
      (sum, project) => sum + project.Capacity,
      0
    );
    setMaxCapacity(totalCapacity);
  }, [projects]);

  // Initialize dropProject state based on projects
  useEffect(() => {
    const initialDropProject = projects.reduce((acc, project) => {
      acc[project._id] = project.dropProject;
      return acc;
    }, {} as Record<string, boolean>);
    setDropProject(initialDropProject);
  }, [projects]);

  // Update error state based on active project count
  useEffect(() => {
    setError(activeProjectCount < 3 || activeProjectCount > 4); // Error when less than 3 or greater than 4
  }, [activeProjectCount]);

  // Calculate active project count based on dropProject and projects
  useEffect(() => {
    const activeCount = Object.keys(dropProject).reduce((count, key) => {
      if (!dropProject[key]) {
        const project = projects.find((p) => p._id === key);
        count += project?.Capacity || 0;
      }
      return count;
    }, 0);
    setActiveProjectCount(activeCount);
  }, [dropProject, projects]);

  // Fetch professor and student data
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
        setProjects(studentsRes.projectDetails);
        setProfessor(professorRes.professor);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Fetch admin controls
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

  const handleSwitchChange = async (projectId: string) => {
    setDropProject((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
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
    if (activeProjectCount < 3 || activeProjectCount > 4) {
      alert("Error: Student count must be between 3 and 4 (inclusive).");
      return;
    }

    const confirmSubmit = window.confirm(
      "Are you sure you want to save the changes? This will update the student order."
    );
    if (!confirmSubmit) return;

    try {
      await Promise.all([
        fetch("api/project/update/drop", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dropProject),
        }),
        fetch("/api/professor/student/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            students: projectWiseStudents,
            professor: professor?._id,
            submitStatus: true,
          }),
        }),
      ]);

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
    <div className="space-y-6 p-6 bg-background w-full flex flex-col">
      {/* Professor Info */}
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Professor Information
          </CardTitle>
          <CardDescription className="text-lg">
            {professor?.name}
          </CardDescription>
          <CardDescription className="text-gray-500">
            {professor?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <Tabs defaultValue={projects[0]._id} className="w-full">
                  <TabsList className="flex border-b bg-background">
                    {projects.map(({ _id, Project_No }) => (
                      <TabsTrigger
                        key={_id}
                        value={_id}
                        className="text-md mx-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {Project_No}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {(activeProjectCount < 3 || activeProjectCount > 4) && (
                    <Alert variant="destructive" className="my-4">
                      <AlertDescription>
                        You currently support {activeProjectCount} student
                        capacity. Please adjust the projects to keep the
                        capacity between 3 and 4 (inclusive).
                      </AlertDescription>
                    </Alert>
                  )}

                  {projects.map((project) => (
                    <TabsContent
                      key={project._id}
                      value={project._id}
                      className="p-6 border rounded-lg bg-background shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-xl font-semibold mb-2">
                            {project.Title}
                          </h2>
                          <p className="text-muted-foreground mb-4">
                            {project.Comments}
                          </p>
                          <p className="text-muted-foreground mb-4">
                            Capacity: {project.Capacity}
                          </p>
                        </div>
                        {maxCapacity > 4 && (
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={dropProject[project._id]}
                              onCheckedChange={() =>
                                handleSwitchChange(project._id)
                              }
                            />
                            <Label>Drop this project</Label>
                          </div>
                        )}
                      </div>
                      {dropProject[project._id] ? (
                        <p className="text-muted-foreground">
                          Project has been droped
                        </p>
                      ) : (
                        <>
                          {/* <ScrollArea className="flex-1 border rounded-md bg-background shadow-sm p-2"> */}
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
                                      <Card className="p-4 my-4 shadow-sm hover:bg-accent">
                                        <CardContent>
                                          <div>
                                            {studentGroup.map(
                                              ({ name, roll_no, email }) => (
                                                <div key={roll_no}>
                                                  <h3 className="text-lg font-medium">
                                                    {name}
                                                  </h3>
                                                  <p className="text-sm text-muted-foreground">
                                                    Email: {email}
                                                  </p>
                                                  <p className="text-sm text-muted-foreground">
                                                    Roll Number: {roll_no}
                                                  </p>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </CardContent>
                                        <CardDescription className="text-sm font-bold mt-2 text-primary">
                                          Preference #{pref + 1}
                                        </CardDescription>
                                      </Card>
                                    </SortableItemPP>
                                  )
                                )}
                              </SortableContext>
                            </DndContext>
                          ) : (
                            <p className="text-muted-foreground">
                              No students have selected this project yet.
                            </p>
                          )}
                          {/* </ScrollArea> */}
                        </>
                      )}
                      <div className="mt-4">
                        <Button
                          disabled={error}
                          onClick={handleSubmit}
                          className="w-full sm:w-auto"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <p className="text-center text-muted-foreground">
                  No projects available.
                </p>
              )}
            </>
          ) : (
            <Card className="flex justify-center items-center h-40">
              <CardDescription className="text-muted-foreground font-medium">
                Allotment process yet to be started
              </CardDescription>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ProfessorDashboard;
