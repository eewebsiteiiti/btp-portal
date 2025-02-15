"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function AdminUpload() {
  interface User {
    [key: string]: string | number | boolean;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json<User>(sheet);
        setUsers(parsedData);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users }),
      });
      if (response.ok) {
        alert("Users uploaded successfully");
        setUsers([]);
      } else {
        alert("Failed to upload users");
      }
    } catch (error) {
      console.error("Error uploading users:", error);
      alert("Error uploading users");
    }
    setLoading(false);
  };
console.log(users);

  return (
    <Card className="p-4 w-full max-w-2xl mx-auto mt-6">
      <CardContent>
        <Input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
        {users.length > 0 && (
          <>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  {Object.keys(users[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    {Object.values(user).map((value, i) => (
                      <TableCell key={i}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="mt-4" onClick={handleUpload} disabled={loading}>
              {loading ? "Uploading..." : "Upload Users"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
