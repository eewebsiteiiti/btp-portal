"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ProfessorHeader from "@/components/ProfessorPage/ProfessorHeader";
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
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

const ProfessorDashboard = () => {
  const { data: session } = useSession();
  const [professor, setProfessor] = useState<ProfessorI | null>(null);
  const [controls, setControls] = useState<ControlsI>();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [dropProject, setDropProject] = useState<Record<string, boolean>>({});
  const [projectCapacity, setProjectCapacity] = useState<Record<string, number>>({});
  const [projectWiseStudents, setProjectWiseStudents] = useState<
    Record<string, { pref: number; studentGroup: StudentI[] }[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [error, setError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCapacityConfirm, setShowCapacityConfirm] = useState(false);
  const [capacityToggleProjectId, setCapacityToggleProjectId] = useState<string | null>(null);

  // Calculate max capacity whenever projects change
  useEffect(() => {
    const totalCapacity = projects.reduce(
      (sum, project) => sum + project.capacity,
      0
    );
    setMaxCapacity(totalCapacity);
  }, [projects]);

  // Initialize dropProject and projectCapacity state based on projects
  useEffect(() => {
    const initialDropProject = projects.reduce((acc, project) => {
      acc[project.id] = project.dropProject;
      return acc;
    }, {} as Record<string, boolean>);
    setDropProject(initialDropProject);

    const initialCapacity = projects.reduce((acc, project) => {
      acc[project.id] = project.capacity;
      return acc;
    }, {} as Record<string, number>);
    setProjectCapacity(initialCapacity);
  }, [projects]);

  // Update error state based on active project count
  useEffect(() => {
    const min = controls?.minCapacity ?? 3;
    const max = controls?.maxCapacity ?? 4;
    setError(activeProjectCount < min || activeProjectCount > max);
  }, [activeProjectCount, controls]);

  // Calculate active project count based on dropProject and projectCapacity
  useEffect(() => {
    const activeCount = Object.keys(dropProject).reduce((count, key) => {
      if (!dropProject[key]) {
        count += projectCapacity[key] || 0;
      }
      return count;
    }, 0);
    setActiveProjectCount(activeCount);
  }, [dropProject, projectCapacity]);

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

  const handleCapacityToggle = async (projectId: string, newCapacity: number) => {
    // If reducing from 2 to 1, show confirmation dialog
    if (newCapacity === 1 && projectCapacity[projectId] === 2) {
      setCapacityToggleProjectId(projectId);
      setShowCapacityConfirm(true);
      return;
    }
    // If increasing from 1 to 2, update immediately
    await updateCapacity(projectId, newCapacity);
  };

  const updateCapacity = async (projectId: string, newCapacity: number) => {
    try {
      const res = await fetch("/api/project/update/capacity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, capacity: newCapacity }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update capacity");
        return;
      }

      setProjectCapacity((prev) => ({ ...prev, [projectId]: newCapacity }));

      if (data.groupsBroken > 0) {
        toast.success(
          `Capacity updated. ${data.groupsBroken} group pairing(s) were reset to individual preferences.`
        );
      } else {
        toast.success("Capacity updated successfully.");
      }
    } catch (error) {
      console.error("Error updating capacity:", error);
      toast.error("Failed to update capacity.");
    }
  };

  const confirmCapacityToggle = async () => {
    setShowCapacityConfirm(false);
    if (capacityToggleProjectId) {
      await updateCapacity(capacityToggleProjectId, 1);
      setCapacityToggleProjectId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent, projectId: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setProjectWiseStudents((prev) => {
        const updatedStudents = [...prev[projectId]];
        const oldIndex = updatedStudents.findIndex(
          (item) => item.studentGroup[0].id === active.id
        );
        const newIndex = updatedStudents.findIndex(
          (item) => item.studentGroup[0].id === over?.id
        );
        const newOrder = arrayMove(updatedStudents, oldIndex, newIndex);

        return {
          ...prev,
          [projectId]: newOrder,
        };
      });
    }
  };

  const handleSubmit = () => {
    const min = controls?.minCapacity ?? 3;
    const max = controls?.maxCapacity ?? 4;
    if (activeProjectCount < min || activeProjectCount > max) {
      toast.error(`Student count must be between ${min} and ${max} (inclusive).`);
      return;
    }
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
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
            professor: professor?.id,
            submitStatus: true,
          }),
        }),
      ]);

      toast.success("Student order updated successfully!");
    } catch (error) {
      console.error("Error updating student order:", error);
      toast.error("Failed to update student order.");
    } finally {
      setLoading(false);
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
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Save Changes"
        description="Are you sure you want to save the changes? This will update the student order."
        confirmText="Save Changes"
        onConfirm={confirmSubmit}
      />
      <ConfirmDialog
        open={showCapacityConfirm}
        onOpenChange={setShowCapacityConfirm}
        title="Reduce Capacity"
        description="Changing capacity to 1 will break all group pairings for this project. Group members will be treated as individual preferences."
        confirmText="Reduce Capacity"
        variant="destructive"
        onConfirm={confirmCapacityToggle}
      />

      {/* Professor Info */}
      <ProfessorHeader professor={professor as ProfessorI} projectCount={projects.length} />

      {controls?.professorViewResult ? (
        <ProfessorResult professor_name={professor?.name || ""} />
      ) : (
        <>
          {controls?.studentViewEnableProfessor ? (
            <>
              {/* Project Tabs */}
              {projects.length > 0 ? (
                <Tabs defaultValue={projects[0].id} className="w-full">
                  <TabsList className="flex border-b bg-background">
                    {projects.map(({ id, projectNo }) => (
                      <TabsTrigger
                        key={id}
                        value={id}
                        className="text-md mx-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {projectNo}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {(activeProjectCount < (controls?.minCapacity ?? 3) || activeProjectCount > (controls?.maxCapacity ?? 4)) && (
                    <Alert variant="destructive" className="my-4">
                      <AlertDescription>
                        You currently support {activeProjectCount} student
                        capacity. Please adjust the projects to keep the
                        capacity between {controls?.minCapacity ?? 3} and {controls?.maxCapacity ?? 4} (inclusive).
                      </AlertDescription>
                    </Alert>
                  )}

                  {projects.map((project) => (
                    <TabsContent
                      key={project.id}
                      value={project.id}
                      className="p-6 border rounded-lg bg-background shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-xl font-semibold mb-2">
                            {project.title}
                          </h2>
                          <p className="text-muted-foreground mb-4">
                            {project.comments}
                          </p>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-muted-foreground">Capacity:</span>
                            {maxCapacity > (controls?.maxCapacity ?? 4) && project.capacity === 2 && !dropProject[project.id] ? (
                              <div className="inline-flex items-center rounded-md border p-0.5 gap-0.5">
                                <button
                                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    projectCapacity[project.id] === 1
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-muted"
                                  }`}
                                  onClick={() => handleCapacityToggle(project.id, 1)}
                                >
                                  1
                                </button>
                                <button
                                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    projectCapacity[project.id] === 2
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-muted"
                                  }`}
                                  onClick={() => handleCapacityToggle(project.id, 2)}
                                >
                                  2
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">{projectCapacity[project.id] ?? project.capacity}</span>
                            )}
                          </div>
                        </div>
                        {maxCapacity > (controls?.maxCapacity ?? 4) && (
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={dropProject[project.id]}
                              onCheckedChange={() =>
                                handleSwitchChange(project.id)
                              }
                            />
                            <Label>Drop this project</Label>
                          </div>
                        )}
                      </div>
                      {dropProject[project.id] ? (
                        <p className="text-muted-foreground">
                          Project has been dropped
                        </p>
                      ) : (
                        <>
                          {projectWiseStudents[project.id]?.length > 0 ? (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) =>
                                handleDragEnd(event, project.id)
                              }
                            >
                              <SortableContext
                                items={projectWiseStudents[project.id].map(
                                  (item, index) => item.studentGroup[0]?.id || `group-${index}`
                                )}
                                strategy={verticalListSortingStrategy}
                              >
                                {projectWiseStudents[project.id].map(
                                  ({ studentGroup, pref }, index) => (
                                    <SortableItemPP
                                      key={`${project.id}-${studentGroup[0]?.id || index}`}
                                      id={studentGroup[0]?.id || `group-${index}`}
                                    >
                                      <Card className="p-4 my-4 shadow-sm hover:bg-accent">
                                        <CardContent>
                                          <div>
                                            {studentGroup.map((student) => (
                                              <div key={student.rollNo || student.id}>
                                                <h3 className="text-lg font-medium">
                                                  {student.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                  Email: {student.email}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                  Roll Number: {student.rollNo}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                  CPI: {student.cpi || "N/A"}
                                                </p>
                                              </div>
                                            ))}
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
                Allotment process has not started yet
              </CardDescription>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ProfessorDashboard;
