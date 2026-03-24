"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentI, ProjectI } from "@/types";
import { CheckCircle, Users, User } from "lucide-react";

const StudentSubmittedPreferences = ({ student, program = "BTP", domain }: { student: StudentI; program?: string; domain?: string | null }) => {
  const [projectMap, setProjectMap] = useState<Record<string, ProjectI>>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const params = new URLSearchParams({ program });
        if (domain) params.set("domain", domain);
        const res = await fetch(`/api/project/get?${params}`);
        const data = await res.json();
        const map: Record<string, ProjectI> = {};
        for (const project of data.projects) {
          map[project.id] = project;
        }
        setProjectMap(map);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const preferences = student.preferences || [];

  return (
    <div className="space-y-4">
      <Card className="shadow-md bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold">
              Your Submitted Preferences
            </h2>
          </div>

          {preferences.length === 0 ? (
            <p className="text-gray-500">No preferences found.</p>
          ) : (
            <div className="space-y-3">
              {preferences.map((pref, index) => {
                const project = projectMap[pref.projectId];
                return (
                  <div
                    key={pref.id || pref.projectId}
                    className="flex items-start gap-4 p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">
                        {project?.title || "Loading..."}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                        {project && (
                          <>
                            <span>{project.projectNo}</span>
                            <span>|</span>
                            <span>{project.supervisor}</span>
                            <span>|</span>
                            <span>{project.domain}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {pref.isGroup ? (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Users className="h-3 w-3" />
                          {pref.partnerRollNumber}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs gap-1">
                          <User className="h-3 w-3" />
                          Solo
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSubmittedPreferences;
