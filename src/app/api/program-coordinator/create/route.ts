import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const generateRandomPassword = (): string => {
  return crypto.randomBytes(8).toString("hex");
};

interface PCInput {
  name: string;
  email: string;
  domain: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body.data;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid data format. Expected an array." },
        { status: 400 }
      );
    }

    const created = [];

    for (const pc of data as PCInput[]) {
      const name = String(pc.name ?? "").trim();
      const email = String(pc.email ?? "").trim();
      const domain = String(pc.domain ?? "").trim();

      if (!name || !email || !domain) continue;

      const password = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log(`[INFO] PC created - ${email}, domain: ${domain}, password: ${password}`);

      const createdPC = await prisma.programCoordinator.create({
        data: { name, email, password: hashedPassword, domain },
      });

      created.push(createdPC);
    }

    return NextResponse.json(
      { message: "Program coordinators created successfully", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating program coordinators:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error creating program coordinators", error: errorMessage },
      { status: 500 }
    );
  }
}
