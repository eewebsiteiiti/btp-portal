"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
import { Card } from "@/components/ui/card";
import { Search, Plus, X, GripVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [allProjects, setAllProjects] = useState<ProjectI[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<ProjectI[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectI | null>(null);
  const [error, setError] = useState("");
  const [projectMap, setProjectMap] = useState<{
    [key: string]: { partnerRollNumber: string; status: string };
  }>({});
  const [showConfirm, setShowConfirm] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [supervisorFilter, setSupervisorFilter] = useState<string>("all");

  // Fetch all projects
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const response = await fetch("/api/project/get");
        const data = await response.json();
        setAllProjects(data.projects || []);
      } catch {
        setError("Error fetching projects");
      }
    };
    fetchAllProjects();
  }, []);

  // Fetch student preferences
  useEffect(() => {
    const fetchStudentPreferences = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(
          `/api/student/get?email=${session.user.email}`
        );
        const data = await response.json();
        setStudent(data.student);

        if (data.student?.preferences && data.student.preferences.length > 0) {
          // Fetch projects by preference to get full project data with status
          const prefResponse = await fetch("/api/project/getbypreference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              preferences: data.student.preferences.map(
                (p: { projectId: string }) => ({ project: p.projectId })
              ),
            }),
          });
          const prefData = await prefResponse.json();

          const projectList = prefData.projects.map(
            (p: { project: ProjectI }) => p.project
          );

          const projectStatusMap = prefData.projects.reduce(
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

          setSelectedProjects(projectList);
          setProjectMap(projectStatusMap);
        }
      } catch {
        setError("Error fetching student preferences");
      }
    };

    fetchStudentPreferences();
  }, [session, setStudent]);

  // Get unique domains and supervisors for filters
  const domains = useMemo(() => {
    const uniqueDomains = [...new Set(allProjects.map((p) => p.domain))];
    return uniqueDomains.filter(Boolean).sort();
  }, [allProjects]);

  const supervisors = useMemo(() => {
    const uniqueSupervisors = [...new Set(allProjects.map((p) => p.supervisor))];
    return uniqueSupervisors.filter(Boolean).sort();
  }, [allProjects]);

  // Filter available projects (not yet selected)
  const availableProjects = useMemo(() => {
    const selectedIds = new Set(selectedProjects.map((p) => p.id));
    return allProjects
      .filter((p) => !selectedIds.has(p.id))
      .filter((p) => {
        const matchesSearch =
          searchQuery === "" ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.projectNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.domain.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDomain =
          domainFilter === "all" || p.domain === domainFilter;
        const matchesSupervisor =
          supervisorFilter === "all" || p.supervisor === supervisorFilter;
        return matchesSearch && matchesDomain && matchesSupervisor;
      });
  }, [allProjects, selectedProjects, searchQuery, domainFilter, supervisorFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (over && active.id !== over.id) {
      setSelectedProjects((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id);
        const newIndex = prev.findIndex((p) => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const addProject = (project: ProjectI) => {
    setSelectedProjects((prev) => [...prev, project]);
    // Initialize project map entry
    setProjectMap((prev) => ({
      ...prev,
      [project.id]: { partnerRollNumber: "", status: "Pending" },
    }));
  };

  const removeProject = (projectId: string) => {
    setSelectedProjects((prev) => prev.filter((p) => p.id !== projectId));
    setProjectMap((prev) => {
      const newMap = { ...prev };
      delete newMap[projectId];
      return newMap;
    });
  };

  const savePreferences = async (flag: boolean) => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/student/preference/put", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          preference: selectedProjects.map((p) => ({
            project: p.id,
            isGroup: !!projectMap[p.id]?.partnerRollNumber,
            partnerRollNumber: projectMap[p.id]?.partnerRollNumber || "",
          })),
        }),
      });

      if (!response.ok) throw new Error();
      if (!flag) toast.success("Preferences saved successfully!");
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

    if (selectedProjects.length === 0) {
      toast.error("Please add at least one project to your preferences");
      return;
    }

    const pendingRequests = selectedProjects.filter((p) => {
      if (projectMap[p.id]?.partnerRollNumber !== "") {
        if (projectMap[p.id]?.status === "Pending") {
          return true;
        }
      }
      return false;
    });

    if (pendingRequests.length > 0) {
      toast.error(
        "Please make sure all group requests are resolved before submitting"
      );
      return;
    }

    savePreferences(true);

    if (await checkGroupBreak()) {
      toast.error(
        "Group break detected. Please resolve the issue before submitting preferences"
      );
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
          preference: selectedProjects.map((p) => ({
            project: p.id,
            isGroup: !!projectMap[p.id]?.partnerRollNumber,
            partnerRollNumber: projectMap[p.id]?.partnerRollNumber || "",
          })),
          submitStatus: true,
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

      <div className="flex flex-col h-full gap-4">
        {error && <p className="text-red-500 font-medium">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Left Panel - Available Projects */}
          <div className="flex flex-col border rounded-lg bg-white shadow-md overflow-hidden">
            <div className="p-3 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800 mb-3">
                Available Projects ({availableProjects.length})
              </h3>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, supervisor, project no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={domainFilter} onValueChange={setDomainFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Domains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {domains.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Supervisors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Supervisors</SelectItem>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor} value={supervisor}>
                        {supervisor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {availableProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-800 truncate">
                          {project.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {project.projectNo} | {project.supervisor}
                        </p>
                        <p className="text-xs text-gray-400">
                          {project.domain} | Capacity: {project.capacity}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addProject(project)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {availableProjects.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {searchQuery || domainFilter !== "all" || supervisorFilter !== "all"
                      ? "No projects match your search criteria"
                      : "All projects have been added to your preferences"}
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Selected Preferences (Drag & Drop) */}
          <div className="flex flex-col border rounded-lg bg-white shadow-md overflow-hidden">
            <div className="p-3 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800">
                Your Preferences ({selectedProjects.length})
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Drag to reorder. Top = highest priority.
              </p>
            </div>

            <ScrollArea className="flex-1 p-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(event) => {
                  const project = selectedProjects.find(
                    (p) => p.id === event.active.id
                  );
                  setActiveProject(project || null);
                }}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveProject(null)}
              >
                <SortableContext
                  items={selectedProjects.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {selectedProjects.map((project, index) => (
                      <div key={project.id} className="relative group">
                        <SortableItem
                          id={project.id}
                          project={project}
                          index={index + 1}
                          setProjectMap={setProjectMap}
                          projectMap={projectMap}
                          student={student as StudentI}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProject(project.id)}
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
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

              {selectedProjects.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <GripVertical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No preferences added yet</p>
                  <p className="text-xs mt-1">
                    Add projects from the left panel
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-white shadow-md rounded-md flex justify-between items-center">
          <p className="text-xs text-gray-600">
            Selected: {selectedProjects.length} / {allProjects.length} projects
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
      </div>
    </>
  );
};

export default StudentProjectSelector;
