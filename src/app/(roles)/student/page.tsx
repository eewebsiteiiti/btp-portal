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

export default function StudentPage() {
  const { data: session } = useSession();
  const [order, setOrder] = useState<Record<string, Project[]>>({});
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [roll, setRoll] = useState("");
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
    if (selectedProjects.length > 30) {
      setSelectedProjects((prev) => prev.slice(0, 30));
    }
  }, [selectedProjects]);

  const toggleProjectSelection = (project: Project) => {
    setSelectedProjects((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === project.id);
      if (existingIndex !== -1) {
        return prev.filter((p) => p.id !== project.id);
      }
      if (prev.length < 30) {
        return [...prev, project];
      }
      return prev;
    });
  };

  const validateSelection = () => {
    const selectedProfessors = new Set(
      selectedProjects.map((p) => p.professor)
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
    setError("");
    return true;
  };

  const submitPreferences = async () => {
    if (!session?.user || !validateSelection()) return;
    const response = await fetch("/api/save-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: session.user.email,
        preferences: selectedProjects.map((p, index) => ({
          projectId: p.id,
          preferenceOrder: index + 1,
        })),
      }),
    });
    if (response.ok) {
      alert("Preferences saved successfully!");
    } else {
      alert("Error saving preferences");
    }
  };

  return (
    <div className="space-y-4 h-screen w-full flex flex-col">
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text font-semibold">Student Information</h2>
          <p>Name: {session?.user?.name}</p>
          <p>Email: {session?.user?.email}</p>
          <LogoutButton />
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold m-4">
        Select Your 30 Preferred Projects (Order Matters)
      </h2>
      {error && <p className="text-red-400">{error}</p>}
      <ScrollArea className="flex-1 border rounded-md p-2 w-full overflow-y-auto">
        <div className="space-y-4">
          {Object.keys(order).map((key) => (
            <Card key={key} className="p-4 w-full">
              <CardTitle className="m-4">{key}</CardTitle>
              <CardContent className="space-y-5">
                {order[key].map((project) => {
                  // const selected = selectedProjects.find(
                  //   (p) => p.project.id === project.id
                  // );
                  return (
                    <Card
                      key={project.id}
                      onClick={() => {
                        project.capacity == 1
                          ? toggleProjectSelection(project)
                          : {};
                      }}
                      className={`flex justify-between cursor-pointer p-4 w-full border ${
                        selectedProjects.find((p) => p.id === project.id)
                          ? "border-blue-500 bg-blue-100"
                          : ""
                      }`}
                    >
                      <div className="col-8">
                        <h3 className="text-lg font-medium">{project.title}</h3>
                        <p className="text-sm text-gray-500">
                          Supervisor: {project.professor}
                        </p>
                        <p className="text-sm text-gray-500">
                          Co-Supervisor: {project.cosupervisor}
                        </p>
                        <p className="text-sm text-gray-500">
                          {project.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Capacity: {project.capacity}
                        </p>
                        {project.capacity == 1 ||
                        selectedProjects.indexOf(project) ||
                        selectedProjects.indexOf(project) === 0 ? (
                          selectedProjects.find((p) => p.id === project.id) && (
                            <p className="text-sm font-bold">
                              Preference #
                              {selectedProjects.findIndex(
                                (p) => p.id === project.id
                              ) + 1}
                            </p>
                          )
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="col-4">
                        {project.capacity == 2 ? (
                          <>
                            <input
                              type="text"
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              placeholder="Enter pair roll number"
                              value={roll}
                              onChange={(e) => setRoll(e.target.value)}
                            />
                            <div className="mt-2">
                              <Button
                                disabled={roll.length !== 9}
                                onClick={() => {
                                  // updateGroupInfo(
                                  //   project.id,
                                  //   "Group Memeber"
                                  // );
                                  // Todo: queue with group info add.
                                  toggleProjectSelection(project);
                                  setRoll("");
                                }}
                                className="mr-5"
                              >
                                Submit
                              </Button>
                              {/* <input
                                type="text"
                                placeholder="Enter group member roll number(s)"
                                // value={selected.groupInfo}
                                onChange={(e) =>
                                  updateGroupInfo(project.id, e.target.value)
                                }
                                className="w-full p-2 border rounded-md"
                              /> */}
                              <Button
                                // onClick={() =>
                                //   updateGroupInfo(project.id, "No Group Member")
                                // }
                                onClick={() => {
                                  toggleProjectSelection(project);
                                  setRoll("");
                                }}
                              >
                                Individual
                              </Button>
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 bg-white shadow-md w-full flex justify-between items-center">
        <p className="text-gray-500">Selected: {selectedProjects.length}/30</p>
        <Button
          disabled={selectedProjects.length !== 30 || error !== ""}
          onClick={submitPreferences}
        >
          Submit Preferences
        </Button>
      </div>
    </div>
  );
}
