import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface PreferenceInput {
  project: string;
  isGroup: boolean;
  partnerRollNumber?: string;
  status?: string;
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.email || !data.preference) {
      return NextResponse.json(
        { message: "Email and preference are required" },
        { status: 400 }
      );
    }

    // Fetch existing student data
    const student = await prisma.student.findUnique({
      where: { email: data.email },
      include: {
        preferences: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Update preferences
    const updatedPreferences: PreferenceInput[] = data.preference;
    let updatedCount = 0;

    // Delete existing preferences and recreate them with new order
    await prisma.preference.deleteMany({
      where: { studentId: student.id },
    });

    // Create new preferences with updated order
    for (let index = 0; index < updatedPreferences.length; index++) {
      const newPref = updatedPreferences[index];

      // Find if this preference existed before
      const existingPref = student.preferences.find(
        (p) => p.projectId === newPref.project
      );

      // Determine status
      let status = newPref.status || "Pending";

      // Reset status if partner changed or order changed
      if (existingPref) {
        const oldIndex = student.preferences.findIndex(
          (p) => p.projectId === newPref.project
        );
        if (
          existingPref.partnerRollNumber !== (newPref.partnerRollNumber || "") ||
          oldIndex !== index
        ) {
          status = "Pending";
        }
      }

      await prisma.preference.create({
        data: {
          studentId: student.id,
          projectId: newPref.project,
          orderIndex: index,
          isGroup: newPref.isGroup || false,
          partnerRollNumber: newPref.partnerRollNumber || "",
          status,
        },
      });
    }

    // Update student's submit status
    await prisma.student.update({
      where: { id: student.id },
      data: { submitStatus: data.submitStatus || false },
    });

    // Handle group preference validation
    for (let index = 0; index < updatedPreferences.length; index++) {
      const pref = updatedPreferences[index];

      if (pref.isGroup && pref.partnerRollNumber) {
        // Find the partner student
        const partner = await prisma.student.findUnique({
          where: { rollNo: pref.partnerRollNumber },
          include: {
            preferences: {
              orderBy: { orderIndex: "asc" },
            },
          },
        });

        if (!partner) continue;

        // Find partner's matching preference
        const partnerPrefIndex = partner.preferences.findIndex(
          (p) =>
            p.projectId === pref.project &&
            p.partnerRollNumber === student.rollNo
        );

        const newStatus =
          partnerPrefIndex !== -1 && partnerPrefIndex === index
            ? "Success"
            : "Pending";

        // Update student's preference status
        await prisma.preference.updateMany({
          where: {
            studentId: student.id,
            projectId: pref.project,
          },
          data: { status: newStatus },
        });

        // Update partner's preference status if they have matching preference
        if (partnerPrefIndex !== -1) {
          await prisma.preference.updateMany({
            where: {
              studentId: partner.id,
              projectId: pref.project,
            },
            data: { status: newStatus },
          });

          if (newStatus === "Success") {
            updatedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      message:
        updatedCount > 0
          ? "Preferences updated successfully, some statuses set to success"
          : "Preferences updated, status reset where needed",
      status: 200,
    });
  } catch (error) {
    console.error("Error updating student preferences:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error updating preferences", error: errorMessage },
      { status: 500 }
    );
  }
}
