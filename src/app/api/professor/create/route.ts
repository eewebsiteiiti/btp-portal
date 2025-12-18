import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

const generateRandomPassword = (): string => {
  return crypto.randomBytes(8).toString("hex"); // 16 characters
};

const sendEmail = async (email: string, name: string, password: string): Promise<void> => {
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
    subject: "BTP Project Allocation Portal - Faculty Login Credentials",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">BTP Project Allocation Portal</h2>

        <p>Dear <strong>${name}</strong>,</p>

        <p>Your faculty account for the BTP Project Allocation Portal has been created.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Your Login Credentials</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
        </div>

        <h3 style="color: #374151;">Portal Features</h3>
        <ul>
          <li>View students who have selected your projects</li>
          <li>Rank students based on your preference</li>
          <li>Manage project availability</li>
          <li>View final allocation results</li>
        </ul>

        <p style="background-color: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <strong>Note:</strong> Please change your password after your first login for security purposes.
        </p>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          For any queries, please contact the Department of Electrical Engineering.
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

interface ProfessorInput {
  name: string;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body.data;
    const sendEmails = body.sendEmails ?? false;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid data format. Expected an array of professors." },
        { status: 400 }
      );
    }

    const createdProfessors = [];

    for (const professor of data as ProfessorInput[]) {
      // Convert values to strings to handle Excel numeric types
      const name = String(professor.name ?? "").trim();
      const email = String(professor.email ?? "").trim();

      // Validate required fields
      if (!name || !email) {
        continue; // Skip invalid entries
      }

      const password = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Send email with credentials if enabled
      if (sendEmails) {
        try {
          await sendEmail(email, name, password);
          await delay(500); // Add a delay of 500ms between emails
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
          // Continue even if email fails
        }
      } else {
        console.log(`[INFO] Email disabled - ${email}, password: ${password}`);
      }

      // Find projects that belong to this professor
      const projects = await prisma.project.findMany({
        where: { supervisorEmail: email },
        select: { id: true },
      });

      const createdProfessor = await prisma.professor.create({
        data: {
          name,
          email,
          password: hashedPassword,
          studentsPreference: "{}",
          projects: {
            connect: projects.map((p) => ({ id: p.id })),
          },
        },
        include: { projects: true },
      });

      createdProfessors.push(createdProfessor);
    }

    return NextResponse.json(
      { message: "Professors added successfully", professors: createdProfessors },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating professors:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error creating professors", error: errorMessage },
      { status: 500 }
    );
  }
}
