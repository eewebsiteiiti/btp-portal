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
    const body = await req.json();
    const data = body.data;
    const sendEmails = body.sendEmails ?? false;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid data format. Expected an array of students." },
        { status: 400 }
      );
    }

    const createdStudents = [];

    for (const student of data as StudentInput[]) {
      // Convert values to strings to handle Excel numeric types
      const rollNo = String(student.roll_no ?? "").trim();
      const name = String(student.name ?? "").trim();
      const email = String(student.email ?? "").trim();

      // Validate required fields
      if (!rollNo || !name || !email) {
        continue; // Skip invalid entries
      }

      const password = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Send email with credentials if enabled
      if (sendEmails) {
        try {
          await sendEmail(email, password);
          await delay(500); // Add a delay of 500ms between emails
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
          // Continue even if email fails
        }
      } else {
        console.log(`[INFO] Email disabled - ${email}, password: ${password}`);
      }

      // Create student with empty preferences
      const createdStudent = await prisma.student.create({
        data: {
          rollNo,
          name,
          email,
          password: hashedPassword,
          cpi: student.cpi ? Number(student.cpi) : null,
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
