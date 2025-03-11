import { dbConnect } from "@/lib/mongodb";
import AssignedProjects from "@/models/AssignedProjects";
import Project from "@/models/Project";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import { ProjectAllotment, ProjectI, StudentDetails } from "@/types";


const findStudentFromId = (studId: string[], students: any[]) => {
  const studs: StudentDetails[] = []
  studId.map((stud) => {
    students.map((student) => {
      if (student._id.toString() === stud.toString()) {
        const stud_details: StudentDetails = {
          "name": student.name,
          "roll_no": student.roll_no
        }
        studs.push(stud_details);
        console.log(studs)
      }
    })
  })
  return studs;
}

const findProjectFromId = (proj_id: string, projects: any[]) => {
  let proj;
  projects.map((project: { _id: { toString: () => any; }; }) => {
    if (project._id.toString() === proj_id) {
      proj = project;
    }
  })
  return proj;
}

export async function GET() {
  try {
    await dbConnect();

    // Fetch assigned projects, students, and projects
    const assignedProjects = await AssignedProjects.find({});
    const students = await Student.find({});
    const projects = await Project.find({});
    const final_response: ProjectAllotment[] = [];
    const projectStudenGroupMap: { [key: string]: string[] } = {};
    assignedProjects.forEach((assignedProject) => {
      const proj_id = assignedProject.projectId;
      const stud_id = assignedProject.studentId;
      if (!projectStudenGroupMap[proj_id])
        projectStudenGroupMap[proj_id] = [];
      projectStudenGroupMap[proj_id].push(
        stud_id
      );
      // final_response.push(res)
    });
    // console.log(projectStudenGroupMap);

    Object.keys(projectStudenGroupMap).map((proj_id) => {
      const stud_id = projectStudenGroupMap[proj_id];
      const proj = findProjectFromId(proj_id, projects);
      const studs = findStudentFromId(stud_id, students);

      const res: ProjectAllotment = {
        project_id: proj.Project_No,
        project_name: proj.Title,
        project_capacity: proj.Capacity,
        project_supervisor: proj.Supervisor,
        // project_cosupervisor: proj.Cosupervisor,
        studentsDetails: studs
      }
      final_response.push(res);
    })
    return NextResponse.json({
      message: "Success",
      data: final_response,
    });

    // Create a map to store project details with assigned students
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
