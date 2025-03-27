import { NextRequest, NextResponse } from "next/server";
import Student from "@/models/Student";
import Project from "@/models/Project";
import { dbConnect } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex"); // 16 characters
};

const sendEmail = async (email: string, password: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // App password (generated from Google)
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
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    let data = await req.json();
    data = data.data;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid data format" },
        { status: 400 }
      );
    }

    // Fetch all projects
    const projects = await Project.find({}, "_id");

    const studentsData = [];

    for (const student of data) {
      const password = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);
      // const password = "a";
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Send email with a delay to avoid rate limiting
      await sendEmail(student.email, password);
      await delay(500); // Add a delay of 500ms between emails

      const studentData = {
        roll_no: student.roll_no,
        name: student.name,
        email: student.email,
        password: hashedPassword,
        preferences: projects.map((project) => ({
          project: project._id,
          isGroup: false,
          partnerRollNumber: "",
          status: "Pending",
        })),
        cpi: student.cpi,
      };

      studentsData.push(studentData);
    }

    // Insert all students at once after processing
    const students = await Student.insertMany(studentsData);

    return NextResponse.json(
      { message: "Students added successfully", students },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error processing request", error: errorMessage },
      { status: 500 }
    );
  }
}
