"use client";
import { useState, useEffect } from "react";
import { StudentI, ControlsI } from "@/types";
import { useSession } from "next-auth/react";

import StudentResult from "@/components/StudentPage/StudentResult";
import StudentHeader from "@/components/StudentPage/StudentHeader";
import StudentProjectSelector from "@/components/StudentPage/StudentProjectSelector";
import Loading from "@/components/Loading";

export default function StudentPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<StudentI>();
  const [controls, setControls] = useState<ControlsI>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchStudent = async () => {
      try {
        const res = await fetch(
          `/api/student/get/?email=${session.user.email}`
        );
        const data = await res.json();
        setStudent(data.student);
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [session]);

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

  if (loading) return <Loading />;

  return (
    <div className="space-y-4 p-4 bg-gray-100 h-screen w-full flex flex-col">
      <StudentHeader student={student as StudentI} />
      {controls?.studentViewResult ? (
        <StudentResult roll_no={student?.roll_no || ""} />
      ) : !student?.submitStatus ? (
        controls?.projectViewEnableStudent ? (
          <StudentProjectSelector
            student={student as StudentI}
            setStudent={setStudent}
            controls={controls}
          />
        ) : (
          <div className="flex justify-center items-center h-40 border rounded-md bg-white shadow-md">
            <p className="text-gray-500 font-medium">
              Allotment process yet to be started
            </p>
          </div>
        )
      ) : (
        <div className="flex justify-center items-center h-40 border rounded-md bg-white shadow-md">
          <p className="text-gray-500 font-medium">
            You have already submitted your preferences
          </p>
        </div>
      )}
    </div>
  );
}
