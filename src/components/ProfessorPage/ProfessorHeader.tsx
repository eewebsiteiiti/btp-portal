"use client";

import { ProfessorI } from "@/types";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import Link from "next/link";
import {
  User,
  Mail,
  FolderKanban,
  CheckCircle,
  Clock,
} from "lucide-react";

interface ProfessorHeaderProps {
  professor: ProfessorI;
  projectCount?: number;
}

const ProfessorHeader = ({ professor, projectCount = 0 }: ProfessorHeaderProps) => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <>
      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
      <Card className="shadow-md rounded-lg bg-white">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left side - Professor Info */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {professor?.name}
                </h2>
                <Badge variant={professor?.submitStatus ? "default" : "secondary"}>
                  {professor?.submitStatus ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" /> Submitted
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" /> Pending
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {professor?.email}
                </span>
                {projectCount > 0 && (
                  <span className="flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" />
                    {projectCount} Project{projectCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {/* Your Preference - prominent action */}
              <Button asChild size="sm" className="mt-3">
                <Link href="/professor/your-preference">View Your Preference</Link>
              </Button>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:self-start flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowChangePassword(true)}>
              Change Password
            </Button>
            <LogoutButton />
          </div>
        </div>
      </Card>
    </>
  );
};

export default ProfessorHeader;
