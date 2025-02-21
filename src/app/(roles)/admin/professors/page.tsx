"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react"; // Icons for action buttons
import { Card } from "@/components/ui/card"; // Wrapping table in a card UI
import Link from "next/link";
import { ProfessorI } from "@/types";

const ProfessorPage = () => {
  const [professor, setProfessor] = useState<ProfessorI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchprofessor = async () => {
      try {
        const response = await fetch("/api/professor/get");
        if (!response.ok) throw new Error("Failed to fetch professor");
        const data = await response.json();
        setProfessor(data.professors);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchprofessor();
  }, []);

  return (
    <div className="p-6">
      <Link href="/admin" className="text-blue-600">
        Dashboard
      </Link>{" "}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📚 Professor Management
      </h1>
      {loading ? (
        <p className="text-center text-lg font-medium">Loading professor...</p>
      ) : error ? (
        <p className="text-red-500 text-center text-lg">{error}</p>
      ) : (
        <Card className="p-4 shadow-lg rounded-xl">
          <div className="overflow-x-auto">
            <Table className="w-full border border-gray-200 rounded-lg">
              {/* Table Header */}
              <TableHeader className="sticky top-0 bg-gray-200">
                <TableRow>
                  <TableHead className="font-bold py-3 text-gray-700">
                    faculty_id
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Name
                  </TableHead>
                  <TableHead className="font-bold py-3 text-gray-700">
                    Email
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {professor && professor.length > 0 ? (
                  professor.map((prof, index) => (
                    <TableRow
                      key={prof._id}
                      className={`transition-all ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100`}
                    >
                      <TableCell className="py-2 text-gray-800 font-medium">
                        {prof._id}
                      </TableCell>
                      <TableCell className="py-2 text-gray-800">
                        {prof.name}
                      </TableCell>
                      <TableCell className="py-2 text-gray-600">
                        {prof.email}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <Button variant="outline" size="icon" className="mr-2">
                          <Pencil size={18} className="text-blue-600" />
                        </Button>
                        <Button variant="outline" size="icon" className="mr-2">
                          <Trash size={18} className="text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
                    >
                      No professor found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfessorPage;
