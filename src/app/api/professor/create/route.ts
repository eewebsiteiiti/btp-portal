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
    subject: "Your BTP Portal Credentials",
    text: `Welcome to the BTP Portal, ${name}!\n\nYour login details are:\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.\n`,
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
