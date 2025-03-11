"use client";

import { use, useEffect, useState } from "react";

const page = () => {
  const [projectStudents, setProjectStudents] = useState([]);
  useEffect(() => {
    // code
    const projectStudents = async () => {
      const res = await fetch("/api/admin/assigned-projects");
      const data = await res.json();
      console.log(data);
      setProjectStudents(projectStudents);
    };
    const projects = async () => {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
    };
    projects();
    projectStudents();
  }, [projectStudents]);
  console.log(projectStudents);

  return <div>page</div>;
};

export default page;
