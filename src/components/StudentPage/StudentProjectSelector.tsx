"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
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
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

const StudentProjectSelector = ({
  student,
  setStudent,
  controls,
}: {
  student: StudentI;
  setStudent: React.Dispatch<React.SetStateAction<StudentI | undefined>>;
  controls: ControlsI;
}) => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectI | null>(null);
  const [error, setError] = useState("");
  const [preferenceArray, setPreferenceArray] = useState<
    { project: string; projectId?: string }[]
  >([]);
  const [projectMap, setProjectMap] = useState<{
    [key: string]: { partnerRollNumber: string; status: string };
  }>({});
  const [showConfirm, setShowConfirm] = useState(false);

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
          // Map preferences to use projectId
          const mappedPrefs = data.student.preferences.map(
            (p: { projectId: string; project?: { id: string } }) => ({
              project: p.projectId || p.project?.id,
            })
          );
          setPreferenceArray(mappedPrefs);
        } else {
          setPreferenceArray([]);
        }
      } catch {
        setError("Error fetching student preferences");
      }
    };

    fetchStudentPreferences();
  }, [session, setStudent]);

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
            acc[project.project.id] = {
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (over && active.id !== over.id) {
      setProjects((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id);
        const newIndex = prev.findIndex((p) => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const savePreferences = async (flag: boolean) => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/student/preference/put", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          preference: projects.map((p) => ({
            project: p.id,
            isGroup: !!projectMap[p.id]?.partnerRollNumber,
            partnerRollNumber: projectMap[p.id]?.partnerRollNumber || "",
          })),
        }),
      });

      if (!response.ok) throw new Error();
      if (!flag) toast.success("Preferences saved successfully!");

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
            const mappedPrefs = data.student.preferences.map(
              (p: { projectId: string }) => ({
                project: p.projectId,
              })
            );
            setPreferenceArray(mappedPrefs);
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

  const checkGroupBreak = async () => {
    try {
      const response = await fetch("/api/student/checkgroupbreak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_no: student?.rollNo,
        }),
      });

      const data = await response.json();
      return data.groupBreak;
    } catch {
      setError("Error checking group break");
      return false;
    }
  };

  const submitPreferences = async () => {
    if (!session?.user) return;

    const pendingRequests = projects.filter((p) => {
      if (projectMap[p.id]?.partnerRollNumber !== "") {
        if (projectMap[p.id]?.status === "Pending") {
          return true;
        }
      }
      return false;
    });

    if (pendingRequests.length > 0) {
      toast.error("Please make sure all group requests are resolved before submitting");
      return;
    }

    savePreferences(true);

    if (await checkGroupBreak()) {
      toast.error("Group break detected. Please resolve the issue before submitting preferences");
      return;
    }

    setShowConfirm(true);
  };

  const confirmSubmitPreferences = async () => {
    if (!session?.user) return;
    setShowConfirm(false);

    try {
      const response = await fetch("/api/student/preference/put", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          preference: projects.map((p) => ({
            project: p.id,
            isGroup: !!projectMap[p.id]?.partnerRollNumber,
            partnerRollNumber: projectMap[p.id]?.partnerRollNumber || "",
          })),
          submitStatus: "true",
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Preferences submitted successfully!");
      setStudent({ ...student, submitStatus: true } as StudentI);
    } catch {
      toast.error("Error saving preferences");
    }
  };

  return (
    <>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Submit Preferences"
        description="Are you sure you want to submit your preferences? Once submitted, you cannot modify them."
        confirmText="Submit"
        onConfirm={confirmSubmitPreferences}
      />
      <h2 className="font-semibold text-gray-800">
        Order Your Preferred Projects
      </h2>
      {error && <p className="text-red-500 font-medium">{error}</p>}
      <ScrollArea className="flex-1 border rounded-md bg-white shadow-md p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => {
            const project = projects.find((p) => p.id === event.active.id);
            setActiveProject(project || null);
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveProject(null)}
        >
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="flex flex-col space-y-2 border rounded-md p-3 shadow-sm"
                >
                  <SortableItem
                    id={project.id}
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
                id={activeProject.id}
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
        <div className="flex gap-2">
          <Button
            onClick={() => savePreferences(false)}
            variant="outline"
            className="text-xs"
          >
            Save Draft
          </Button>
          {controls?.submitEnableStudentProjects && (
            <Button onClick={submitPreferences} className="text-xs">
              Submit Final
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentProjectSelector;
