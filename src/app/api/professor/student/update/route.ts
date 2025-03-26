import { NextRequest, NextResponse } from "next/server";
import { StudentI } from "@/types";
import Professor from "@/models/Professor";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";
import * as XLSX from "xlsx";
import Project from "@/models/Project";
import nodemailer from "nodemailer";


function generateExcel(excelData: { "Project Title": any; Status: string; "Student Name": string; "Roll Number": string; "Preference Rank": number; }[]) {
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Preferences");

  // Write the workbook to a buffer
  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return excelBuffer;
}


async function sendMail(mailOptions: {
  from: string; // sender address
  to: string; // list of receivers
  subject: string; // Subject line
  text: string; // plain text body
  html: string; // html body
  attachments: { filename: string; content: any }[];
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use Gmail as the email service
    auth: {
      user: "ee210002065@iiti.ac.in", // Your email address
      pass: "gypn mtik vnnd buev ", // Your email password or app-specific password
    },
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const studentsPreferenceResponse = data.students;
    const professor_id = data.professor;
    const studentsPreferenceFormatted: { [key: string]: StudentI[][] } = {};
    for (const [projectId, students] of Object.entries(
      studentsPreferenceResponse
    )) {
      studentsPreferenceFormatted[projectId] = (
        students as { pref: number; studentGroup: StudentI[] }[]
      ).map(({ studentGroup }) => {
        return studentGroup;
      });
    }

    // console.log(studentsPreferenceFormatted);
    await Professor.findByIdAndUpdate(
      professor_id,
      {
        studentsPreference: studentsPreferenceFormatted,
        submitStatus: data.submitStatus,
      },
      { new: true }
    );

    const projects = await Project.find({ _id: { $in: Object.keys(studentsPreferenceFormatted) } });
    const students = await Student.find({ _id: { $in: Object.values(studentsPreferenceFormatted).flat(2).map((student: StudentI) => student._id) } });

    // create a map for student id and roll number of corresponding student for the project
    const studentRollNoMap: { [key: string]: string } = {};
    students.forEach((student) => {
      studentRollNoMap[student._id] = student.roll_no;
    });

    // console.log(professorupdate);

    // create a json for each column to be the project title, status, student name, roll number and preference rank
    const excelData = projects.map((project) => {
      const projectStudents = studentsPreferenceFormatted[project._id];
      return projectStudents.map((student_s, index) => {
        return student_s.map((student) => {
          return {
            "Project Title": project.Title,
            Status: project.dropProject ? "Dropped" : "Selected",
            "Student Name": student.name,
            "Roll Number": studentRollNoMap[student._id],
            "Preference Rank": index + 1,
          };
        }
        );
      });
    }).flat(2);

    // sending the excel of student preferences to the professor
    const excel = await generateExcel(excelData);
    const mailOptions = {
      from: "ee210002065@iiti.ac.in", // sender address
      to: "ee210002065@iiti.ac.in", // list of receivers
      subject: "Student Preferences", // Subject line
      text: "Student Preferences", // plain text body
      html: "<b>Student Preferences</b>", // html body
      attachments: [
        {
          filename: "StudentPreferences.xlsx",
          content: excel,
        },
      ],
    };
    await sendMail(mailOptions); // send mail to the professor

    return NextResponse.json(
      { message: "This is a POST request" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating student preferences:", error as Error);
    return NextResponse.json(
      { message: "Error updating preferences", error },
      { status: 500 }
    );
  }
}


