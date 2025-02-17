"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton";

interface Project {
  id: string;
  title: string;
  domain: string;
  professor: string;
  cosupervisor: string;
  description: string;
  capacity: number;
}
interface Group {
  isGroup: boolean;
  roll_no: string;
}
interface Preferences {
  project: Project;
  group: Group;
}

export default function StudentPage() {
  const { data: session } = useSession();
  const [order, setOrder] = useState<Record<string, Project[]>>({});
  const [selectedPreferences, setSelectedPreferences] = useState<Preferences[]>(
    []
  );
  const [rollNumbers, setRollNumbers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProjectOrder = async () => {
      try {
        const response = await fetch("/api/project/order");
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjectOrder();
  }, []);

  useEffect(() => {
    if (selectedPreferences.length > 30) {
      setSelectedPreferences((prev) => prev.slice(0, 30));
    }
  }, [selectedPreferences]);

  const toggleProjectSelection = (project: Project, group: Group) => {
    setSelectedPreferences((prev) => {
      const existingIndex = prev.findIndex((p) => p.project.id === project.id);
      if (existingIndex !== -1) {
        return prev.filter((p) => p.project.id !== project.id);
      }
      if (prev.length < 30) {
        return [...prev, { project, group }];
      }
      return prev;
    });
  };

  const validateSelection = () => {
    const selectedProfessors = new Set(
      selectedPreferences.map((p) => p.project.professor)
    );
    const requiredProfessors = new Set(
      Object.values(order)
        .flat()
        .map((p) => p.professor)
    );

    if (selectedProfessors.size < requiredProfessors.size) {
      setError("You must select at least one project from each professor.");
      return false;
    }
    const profs = new Set(Object.keys(order));
    let selectedProfs = new Set(
      selectedPreferences.map((p) => p.project.professor)
    );
    if (selectedProfs.size < profs.size) {
      setError("You must select at least one project from each professor.");
      return false;
    }
    setError("");
    return true;
  };

  const submitPreferences = async () => {
    if (!session?.user || !validateSelection()) return;

    const response = await fetch("/api/student/preference/put", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        name: session.user.name,
        preference: selectedPreferences,
      }),
    });

    if (response.ok) {
      alert("Preferences saved successfully!");
    } else {
      alert("Error saving preferences");
    }
  };
  console.log(selectedPreferences);
  return (
    <div className="space-y-4 h-screen w-full flex flex-col p-4 bg-gray-100 text-sm">
      {/* Student Info Card */}
      <Card className="w-full bg-white shadow-md rounded-lg p-3">
        <CardContent>
          <h2 className="text-base font-semibold text-gray-800">
            Student Information
          </h2>
          <p className="text-gray-600">Name: {session?.user?.name}</p>
          <p className="text-gray-600">Email: {session?.user?.email}</p>
          <LogoutButton />
        </CardContent>
      </Card>

      {/* Project Selection Section */}
      <h2 className="text-base font-semibold text-gray-800">
        Select Your 30 Preferred Projects
      </h2>
      {error && <p className="text-red-500 font-medium">{error}</p>}

      <ScrollArea className="flex-1 border rounded-md bg-white shadow-md p-2 overflow-y-auto">
        <div className="space-y-3">
          {Object.keys(order).map((key) => (
            <Card key={key} className="bg-gray-50 shadow-sm p-3 rounded-lg">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {key}
              </CardTitle>
              <CardContent className="space-y-2">
                {order[key].map((project) => {
                  const selectedProject = selectedPreferences.find(
                    (p) => p.project.id === project.id
                  );
                  return (
                    <Card
                      key={project.id}
                      onClick={(e) => {
                        if (
                          (e.target as HTMLElement).tagName !== "INPUT" &&
                          (e.target as HTMLElement).tagName !== "BUTTON"
                        ) {
                          toggleProjectSelection(project, {
                            isGroup: false,
                            roll_no: "",
                          });
                        }
                      }}
                      className={`flex justify-between cursor-pointer p-3 rounded-md border transition-all duration-200 ${
                        selectedProject
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-3/4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {project.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Supervisor: {project.professor}
                        </p>
                        <p className="text-xs text-gray-500">
                          Co-Supervisor: {project.cosupervisor}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {project.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Capacity: {project.capacity}
                        </p>

                        {selectedProject && (
                          <p className="text-xs font-semibold text-blue-600 mt-1">
                            Preference #
                            {selectedPreferences.findIndex(
                              (p) => p.project.id === project.id
                            ) + 1}
                          </p>
                        )}
                        {selectedProject?.group.isGroup && (
                          <p className="text-xs font-semibold text-red-500">
                            Partner Roll: {selectedProject.group.roll_no}
                          </p>
                        )}
                      </div>

                      {project.capacity === 2 && (
                        <div className="flex flex-col space-y-1 w-1/6">
                          <input
                            type="text"
                            className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-blue-400 focus:border-blue-400"
                            placeholder="Partner Roll"
                            value={rollNumbers[project.id] || ""}
                            onChange={(e) =>
                              setRollNumbers((prev) => ({
                                ...prev,
                                [project.id]: e.target.value,
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            disabled={
                              (rollNumbers[project.id] || "").length !== 9
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProjectSelection(project, {
                                isGroup: true,
                                roll_no: rollNumbers[project.id] || "",
                              });
                              setRollNumbers((prev) => ({
                                ...prev,
                                [project.id]: "",
                              }));
                            }}
                            className=" text-white text-xs px-3 py-1 rounded-md  transition-all"
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Submit Button */}
      <div className="p-3 bg-white shadow-md rounded-md flex justify-between items-center">
        <p className="text-xs text-gray-600">
          Selected: {selectedPreferences.length}/30
        </p>
        <Button
          disabled={selectedPreferences.length !== 30 || error !== ""}
          onClick={submitPreferences}
          className="bg-green-500 text-white text-xs px-4 py-2 rounded-md hover:bg-green-600 transition-all"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
