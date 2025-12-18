import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

const generateRandomPassword = (): string => {
  return crypto.randomBytes(8).toString("hex"); // 16 characters
};

const sendEmail = async (email: string, name: string, rollNo: string, password: string): Promise<void> => {
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
    subject: "BTP Project Allocation Portal - Student Login Credentials",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">BTP Project Allocation Portal</h2>

        <p>Dear <strong>${name}</strong>,</p>

        <p>Welcome to the BTP Project Allocation Portal. Your account has been created successfully.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Your Login Credentials</h3>
          <p><strong>Roll Number:</strong> ${rollNo}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
        </div>

        <h3 style="color: #374151;">Next Steps</h3>
        <ol>
          <li>Login to the portal using your credentials</li>
          <li>Change your password from the dashboard (recommended)</li>
          <li>Browse available BTP projects</li>
          <li>Submit your project preferences in order of priority</li>
        </ol>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have any issues, please contact the Department of Electrical Engineering.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">
          This is an automated message from the BTP Allocation Portal, IIT Indore.
        </p>
      </div>
    `,
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
          await sendEmail(email, name, rollNo, password);
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
