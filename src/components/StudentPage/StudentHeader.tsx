"use client";

import { StudentI } from "@/types";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import {
  GraduationCap,
  Mail,
  Hash,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";

const StudentHeader = ({ student }: { student: StudentI }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <>
      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
      <Card className="shadow-md rounded-lg bg-white">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left side - Student Info */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {student?.name}
                </h2>
                <Badge variant={student?.submitStatus ? "default" : "secondary"}>
                  {student?.submitStatus ? (
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
                  <Hash className="h-3 w-3" />
                  {student?.rollNo}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {student?.email}
                </span>
                {student?.cpi && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    CPI: {student.cpi}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:self-start">
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

export default StudentHeader;
