"use client";
import { useState, useEffect } from "react";
import { StudentI, ControlsI } from "@/types";
import { useSession } from "next-auth/react";

import StudentResult from "@/components/StudentPage/StudentResult";
import StudentHeader from "@/components/StudentPage/StudentHeader";
import StudentProjectSelector from "@/components/StudentPage/StudentProjectSelector";
import StudentSubmittedPreferences from "@/components/StudentPage/StudentSubmittedPreferences";
import Loading from "@/components/Loading";

export default function MtpStudentPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<StudentI>();
  const [controls, setControls] = useState<ControlsI>();
  const [loading, setLoading] = useState(true);

  const domain = session?.user?.domain;

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
    if (!domain) return;

    const fetchMtpControls = async () => {
      try {
        const res = await fetch(`/api/dpgc/submit-control?domain=${domain}`);
        const data = await res.json();
        setControls(data);
      } catch (error) {
        console.error("Error fetching MTP controls:", error);
      }
    };

    fetchMtpControls();
  }, [domain]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-4 p-4 bg-gray-100 h-screen w-full flex flex-col">
      <StudentHeader student={student as StudentI} />
      {controls?.studentViewResult ? (
        <StudentResult
          rollNo={student?.rollNo || ""}
          program="MTP"
          domain={domain}
        />
      ) : !student?.submitStatus ? (
        controls?.projectViewEnableStudent ? (
          <StudentProjectSelector
            student={student as StudentI}
            setStudent={setStudent}
            controls={controls as ControlsI}
            program="MTP"
            domain={domain}
          />
        ) : (
          <div className="flex justify-center items-center h-40 border rounded-md bg-white shadow-md">
            <p className="text-gray-500 font-medium">
              MTP allotment process yet to be started
            </p>
          </div>
        )
      ) : (
        <StudentSubmittedPreferences student={student as StudentI} program="MTP" domain={domain} />
      )}
    </div>
  );
}
