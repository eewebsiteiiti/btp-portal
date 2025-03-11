"use client";

import { useEffect, useState } from "react";
import { ProjectAllotment } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const page = () => {
  const [projectAllotment, setProjectAllotment] = useState<ProjectAllotment[]>([]);
  useEffect(() => {
    // code
    const projectAllot = async () => {
      const res = await fetch("/api/admin/assigned-projects");
      const data = await res.json();
      setProjectAllotment(data.data);
    };
    projectAllot()

  }, []);

  return <div>
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">
          ProjectWise Allotment
        </h1>
        <Link href="/admin" className="text-blue-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>

    <Card className="p-6 shadow-md rounded-2xl border border-gray-200">
      <div className="overflow-x-auto">
        <Table className="w-full border-collapse">
          {/* Table Header */}
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                Project ID
              </TableHead>
              <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                Project Name
              </TableHead>
              <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                Supervisor
              </TableHead>
              <TableHead className="py-3 px-4 text-left font-semibold text-gray-600">
                Capacity
              </TableHead>
              <TableHead className="py-3 px-4 text-center font-semibold text-gray-600">
                Student Details
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody>

            {
              projectAllotment && projectAllotment.length > 0 ?
                (projectAllotment.map((allot, index) => (
                  <>
                    <TableRow key={index}
                      className={`transition-all ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-gray-100`}>

                      <TableCell key={0} className="py-4 px-4 text-gray-800 font-medium">
                        {allot.project_id}
                      </TableCell>
                      <TableCell key={1} className="py-4 px-4 text-gray-800 font-medium">
                        {allot.project_name}
                      </TableCell>
                      <TableCell key={2} className="py-4 px-4 text-gray-800 font-medium">
                        {allot.project_supervisor}
                      </TableCell>
                      <TableCell key={3} className="py-4 px-4 text-gray-800 font-medium">
                        {allot.project_capacity}
                      </TableCell>
                      <TableCell key={4} className="py-4 px-4 text-gray-800 font-medium">
                        {allot.studentsDetails.map((students, idx) => (
                          <>
                            <div>
                              {students.name} <span className="mr-5"></span> {students.roll_no}
                            </div>
                          </>
                        ))}
                      </TableCell>
                    </TableRow>
                  </>
                )))

                : (<TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-400"
                  >
                    No Allotment found.
                  </TableCell>
                </TableRow>)
            }
          </TableBody>
        </Table>
      </div>
    </Card>



  </div>;
};

export default page;
