import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import nodemailer from "nodemailer";

interface StudentData {
  id: string;
  _id?: string;
  name: string;
  rollNo?: string;
  roll_no?: string;
}

interface ExcelRow {
  "Project Title": string;
  Status: string;
  "Student Name": string;
  "Roll Number": string;
  "Preference Rank": number;
}

function generateExcel(excelData: ExcelRow[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Preferences");

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;
}

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments: { filename: string; content: Buffer }[];
}

async function sendMail(mailOptions: MailOptions): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
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
    const data = await req.json();

    if (!data.professor || !data.students) {
      return NextResponse.json(
        { message: "Professor ID and students data are required" },
        { status: 400 }
      );
    }

    const professor = await prisma.professor.findUnique({
      where: { id: data.professor },
      include: { projects: true },
    });

    if (!professor) {
      return NextResponse.json(
        { message: "Professor not found" },
        { status: 404 }
      );
    }

    const studentsPreferenceResponse = data.students;

    // Format students preference for storage
    const studentsPreferenceFormatted: { [key: string]: StudentData[][] } = {};

    for (const [projectId, students] of Object.entries(studentsPreferenceResponse)) {
      studentsPreferenceFormatted[projectId] = (
        students as { pref: number; studentGroup: StudentData[] }[]
      ).map(({ studentGroup }) => studentGroup);
    }

    // Update professor's preferences
    await prisma.professor.update({
      where: { id: data.professor },
      data: {
        studentsPreference: JSON.stringify(studentsPreferenceFormatted),
        submitStatus: data.submitStatus || false,
      },
    });

    // Generate Excel data
    const projects = await prisma.project.findMany({
      where: { id: { in: Object.keys(studentsPreferenceFormatted) } },
    });

    const studentIds = Object.values(studentsPreferenceFormatted)
      .flat(2)
      .map((student: StudentData) => student.id || student._id)
      .filter(Boolean) as string[];

    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
    });

    // Create student roll number map
    const studentRollNoMap: { [key: string]: string } = {};
    students.forEach((student) => {
      studentRollNoMap[student.id] = student.rollNo;
    });

    // Generate Excel data
    const excelData: ExcelRow[] = projects
      .map((project) => {
        const projectStudents = studentsPreferenceFormatted[project.id];
        if (!projectStudents) return [];

        return projectStudents.map((studentGroup, index) => {
          return studentGroup.map((student: StudentData) => ({
            "Project Title": project.title,
            Status: project.dropProject ? "Dropped" : "Selected",
            "Student Name": student.name,
            "Roll Number": studentRollNoMap[student.id || student._id || ""] || student.rollNo || student.roll_no || "",
            "Preference Rank": index + 1,
          }));
        });
      })
      .flat(2);

    // Send email with Excel attachment
    const now = new Date();
    const submissionTime = now.toLocaleString();

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

    const excel = generateExcel(excelData);
    const mailOptions: MailOptions = {
      from: process.env.EMAIL_USER || "",
      to: professor.email,
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
    console.error("Error updating student preferences:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error updating preferences", error: errorMessage },
      { status: 500 }
    );
  }
}
