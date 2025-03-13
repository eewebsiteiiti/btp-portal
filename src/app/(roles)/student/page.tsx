"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";
import { ProjectI, ControlsI, StudentI } from "@/types";

export default function StudentPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectI | null>(null);
  const [error, setError] = useState("");
  const [preferenceArray, setPreferenceArray] = useState([]);
  const [controls, setControls] = useState<ControlsI>();
  const [student, setStudent] = useState<StudentI>();
  const [projectMap, setProjectMap] = useState<{
    [key: string]: { partnerRollNumber: string; status: string };
  }>({});
  useEffect(() => {
    const fetchStudentPreferences = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(
          `/api/student/get?email=${session.user.email}`
        );
        const data = await response.json();
        setStudent(data.student);

        if (data.student?.preferences) {
          setPreferenceArray(data.student.preferences);
        } else {
          setPreferenceArray([]);
        }
      } catch {
        setError("Error fetching student preferences");
      }
    };

    fetchStudentPreferences();
  }, [session]);

  useEffect(() => {
    if (preferenceArray.length === 0) return;

    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/project/getbypreference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences: preferenceArray }),
        });

        const data = await response.json();
        const projectList = data.projects.map(
          (p: { project: ProjectI }) => p.project
        );

        const projectStatusMap = data.projects.reduce(
          (
            acc: {
              [key: string]: { partnerRollNumber: string; status: string };
            },
            project: {
              project: ProjectI;
              partnerRollNumber?: string;
              status?: string;
            }
          ) => {
            acc[project.project._id] = {
              partnerRollNumber: project.partnerRollNumber || "",
              status: project.status || "Pending",
            };
            return acc;
          },
          {}
        );

        setProjects(projectList);
        setProjectMap(projectStatusMap);
      } catch {
        setError("Error fetching projects");
      }
    };

    fetchProjects();
  }, [preferenceArray]);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (over && active.id !== over.id) {
      setProjects((prev) => {
        const oldIndex = prev.findIndex((p) => p._id === active.id);
        const newIndex = prev.findIndex((p) => p._id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };
  const submitPreferences = async () => {
    if (!session?.user) return;

    const pendingRequests = projects.filter((p) => {
      if (projectMap[p._id]?.partnerRollNumber !== "") {
        if (projectMap[p._id]?.status === "Pending") {
          return true;
        }
      }
    });

    if (pendingRequests.length > 0) {
      alert("Please make sure all requests are resolved before saving");
      return;
    }
    const checkGroupBreak = async () => {
      try {
        const response = await fetch("/api/student/checkgroupbreak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roll_no: student?.roll_no,
          }),
        });

        const data = await response.json();
        return data.groupBreak;
      } catch {
        setError("Error checking group break");
      }
    };
    if (await checkGroupBreak()) {
      alert(
        "Group break detected. Please resolve the issue before submitting preferences"
      );
      return;
    }
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your preferences? Once submitted, you cannot modify them."
    );
    if (!confirmSubmit) return;

    try {
      const response = await fetch("/api/student/preference/put", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          preference: projects.map((p) => ({
            project: p._id,
            isGroup: !!projectMap[p._id]?.partnerRollNumber,
            partnerRollNumber: projectMap[p._id]?.partnerRollNumber || "",
          })),
          submitStatus: "true",
        }),
      });

      if (!response.ok) throw new Error();

      alert("Preferences saved successfully!");
      setStudent({ ...student, submitStatus: true } as StudentI);
    } catch {
      setError("Error saving preferences");
    }
  };
  const savePreferences = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/student/preference/put", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          preference: projects.map((p) => ({
            project: p._id,
            isGroup: !!projectMap[p._id]?.partnerRollNumber,
            partnerRollNumber: projectMap[p._id]?.partnerRollNumber || "",
          })),
        }),
      });

      if (!response.ok) throw new Error();

      alert("Preferences saved successfully!");

      // Refresh list after submitting
      const fetchStudentPreferences = async () => {
        if (!session?.user?.email) return;

        try {
          const response = await fetch(
            `/api/student/get?email=${session.user.email}`
          );
          const data = await response.json();
          setStudent(data.student);
          if (data.student?.preferences) {
            setPreferenceArray(data.student.preferences);
          } else {
            setPreferenceArray([]);
          }
        } catch {
          setError("Error fetching student preferences");
        }
      };

      fetchStudentPreferences();
    } catch {
      setError("Error saving preferences");
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-100 h-screen w-full flex flex-col">
      <Card className="shadow-md rounded-lg p-3 bg-white">
        <CardContent>
          <h2 className="font-semibold text-gray-800">Student Information</h2>
          <p className="text-gray-600">Name: {student?.name}</p>
          <p className="text-gray-600">Email: {student?.email}</p>
          <p className="text-gray-600">Roll Number: {student?.roll_no}</p>

          <LogoutButton />
        </CardContent>
      </Card>
      {student && !student.submitStatus ? (
        <>
          {controls?.projectViewEnableStudent ? (
            <>
              <h2 className="font-semibold text-gray-800">
                Order Your Preferred Projects
              </h2>
              {error && <p className="text-red-500 font-medium">{error}</p>}
              <ScrollArea className="flex-1 border rounded-md bg-white shadow-md p-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(event) => {
                    const project = projects.find(
                      (p) => p._id === event.active.id
                    );
                    setActiveProject(project || null);
                  }}
                  onDragEnd={handleDragEnd}
                  onDragCancel={() => setActiveProject(null)}
                >
                  <SortableContext
                    items={projects.map((p) => p._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {projects.map((project, index) => (
                        <div
                          key={project._id}
                          className="flex flex-col space-y-2 border rounded-md p-3 shadow-sm"
                        >
                          <SortableItem
                            id={project._id}
                            project={project}
                            index={index + 1}
                            setProjectMap={setProjectMap}
                            projectMap={projectMap}
                            student={student as StudentI}
                          />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeProject && (
                      <SortableItem
                        id={activeProject._id}
                        project={activeProject}
                        setProjectMap={setProjectMap}
                        projectMap={projectMap}
                        isOverlay
                        student={student as StudentI}
                      />
                    )}
                  </DragOverlay>
                </DndContext>
              </ScrollArea>
              <div className="p-3 bg-white shadow-md rounded-md flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  Total Projects: {projects.length}
                </p>
                <div>
                  <Button
                    onClick={savePreferences}
                    className="bg-green-500 text-white text-xs px-4 py-2 rounded-md hover:bg-green-600 transition-all mx-2"
                  >
                    Save
                  </Button>
                  {controls?.submitEnableStudentProjects ? (
                    <>
                      <Button
                        onClick={submitPreferences}
                        className="bg-blue-500 text-white text-xs px-4 py-2 rounded-md hover:bg-green-600 transition-all"
                      >
                        Submit
                      </Button>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>{" "}
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
      ) : (
        <>
          <div className="flex justify-center items-center h-40 border rounded-md bg-white shadow-md">
            <p className="text-gray-500 font-medium">
              You have already submitted your preferences
            </p>
          </div>
        </>
      )}
    </div>
  );
}
