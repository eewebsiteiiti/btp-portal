import { NextRequest, NextResponse } from "next/server";
import { StudentI } from "@/types";
import Professor from "@/models/Professor";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";
import * as XLSX from "xlsx";
import Project from "@/models/Project";
import nodemailer from "nodemailer";

function generateExcel(
  excelData: {
    "Project Title": string;
    Status: string;
    "Student Name": string;
    "Roll Number": string;
    "Preference Rank": number;
  }[]
) {
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Preferences");

  // Write the workbook to a buffer
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
  return excelBuffer;
}

async function sendMail(mailOptions: {
  from: string; // sender address
  to: string; // list of receivers
  subject: string; // Subject line
  text: string; // plain text body
  html: string; // html body
  attachments: { filename: string; content: Buffer | string }[];
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use Gmail as the email service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
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
    const professor = await Professor.findById(data.professor);
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

    await Professor.findByIdAndUpdate(
      professor_id,
      {
        studentsPreference: studentsPreferenceFormatted,
        submitStatus: data.submitStatus,
      },
      { new: true }
    );

    const projects = await Project.find({
      _id: { $in: Object.keys(studentsPreferenceFormatted) },
    });
    const students = await Student.find({
      _id: {
        $in: Object.values(studentsPreferenceFormatted)
          .flat(2)
          .map((student: StudentI) => student._id),
      },
    });

    // create a map for student id and roll number of corresponding student for the project
    const studentRollNoMap: { [key: string]: string } = {};
    students.forEach((student) => {
      studentRollNoMap[student._id] = student.roll_no;
    });

    // create a json for each column to be the project title, status, student name, roll number and preference rank
    const excelData = projects
      .map((project) => {
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
          });
        });
      })
      .flat(2);

    // Get current date and time
    const now = new Date();
    const submissionTime = now.toLocaleString();

    // Email content with professor details and submission info
    const emailHtml = `
      <div>
        <h2>Student Preferences Submission Confirmation</h2>
        <p><strong>Professor Name:</strong> ${professor.name}</p>
        <p><strong>Professor Email:</strong> ${professor.email}</p>
        <p><strong>Submission Time:</strong> ${submissionTime}</p>
        <p><strong>Location:</strong> Online Portal</p>
        <p>Attached is the Excel file containing all student preferences for your projects.</p>
        <p>Thank you for submitting your preferences.</p>
      </div>
    `;

    const emailText = `
      Student Preferences Submission Confirmation
      ------------------------------------------
      Professor Name: ${professor.name}
      Professor Email: ${professor.email}
      Submission Time: ${submissionTime}
      Location: Online Portal
      
      Attached is the Excel file containing all student preferences for your projects.
      Thank you for submitting your preferences.
    `;

    // sending the excel of student preferences to the professor
    const excel = generateExcel(excelData);
    const mailOptions = {
      from: process.env.EMAIL_USER || "shuffled720@gmail.com",
      to: `${professor.email}`,
      subject: "Student Preferences Submission Confirmation",
      text: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: "StudentPreferences.xlsx",
          content: excel,
        },
      ],
    };
    await sendMail(mailOptions);

    return NextResponse.json(
      { message: "Preferences updated and email sent successfully" },
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
