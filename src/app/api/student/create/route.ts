import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

const generateRandomPassword = (): string => {
  return crypto.randomBytes(8).toString("hex"); // 16 characters
};

const sendEmail = async (email: string, password: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your BTP Portal Credentials",
    text: `Welcome to the BTP student portal!\n\nYour login details are:\nEmail: ${email}\nPassword: ${password}\n`,
  };

  await transporter.sendMail(mailOptions);
};

// Delay function to prevent rate limiting (500ms between emails)
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface StudentInput {
  roll_no: string;
  name: string;
  email: string;
  cpi?: number;
}

export async function POST(req: NextRequest) {
  try {
    let data = await req.json();
    data = data.data;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid data format. Expected an array of students." },
        { status: 400 }
      );
    }

    // Fetch all projects
    const projects = await prisma.project.findMany({
      select: { id: true },
    });

    const createdStudents = [];

    for (const student of data as StudentInput[]) {
      // Validate required fields
      if (!student.roll_no || !student.name || !student.email) {
        continue; // Skip invalid entries
      }

      const password = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Send email with credentials
      try {
        await sendEmail(student.email, password);
        await delay(500); // Add a delay of 500ms between emails
      } catch (emailError) {
        console.error(`Failed to send email to ${student.email}:`, emailError);
        // Continue even if email fails
      }

      // Create student with preferences for all projects
      const createdStudent = await prisma.student.create({
        data: {
          rollNo: student.roll_no,
          name: student.name,
          email: student.email,
          password: hashedPassword,
          cpi: student.cpi || null,
          preferences: {
            create: projects.map((project, index) => ({
              projectId: project.id,
              orderIndex: index,
              isGroup: false,
              partnerRollNumber: "",
              status: "Pending",
            })),
          },
        },
        include: {
          preferences: true,
        },
      });

      createdStudents.push(createdStudent);
    }

    return NextResponse.json(
      { message: "Students added successfully", students: createdStudents },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating students:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error processing request", error: errorMessage },
      { status: 500 }
    );
  }
}
