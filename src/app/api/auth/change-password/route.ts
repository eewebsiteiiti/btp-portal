import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/helper/authOptions";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const { id, role } = session.user;

    let user;
    if (role === "professor") {
      user = await prisma.professor.findUnique({ where: { id } });
    } else if (role === "student") {
      user = await prisma.student.findUnique({ where: { id } });
    } else {
      return NextResponse.json(
        { message: "Password change not supported for this role" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password based on role
    if (role === "professor") {
      await prisma.professor.update({
        where: { id },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.student.update({
        where: { id },
        data: { password: hashedPassword },
      });
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Something went wrong", error: errorMessage },
      { status: 500 }
    );
  }
}
