import { NextRequest, NextResponse } from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

interface Preference {
  project: string;
  isGroup: boolean;
  partnerRollNumber?: string;
  status?: string;
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const data = await req.json();
    if (!data.email || !data.preference) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // Fetch existing student data
    const student = await Student.findOne({ email: data.email });
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    const updatedPreferences = data.preference.map((newPref: Preference, index: number) => {
      const existingPref = student.preferences.find(
        (p: Preference) => p.project.toString() === newPref.project.toString()
      );

      // Reset status to "Pending" if:
      // 1. The partnerRollNumber changed.
      // 2. The project order (index) changed.
      if (
        !existingPref ||
        existingPref.partnerRollNumber !== newPref.partnerRollNumber ||
        student.preferences.findIndex((p: Preference) => p.project.toString() === newPref.project.toString()) !== index
      ) {
        newPref.status = "Pending";
      }

      return newPref;
    });

    // Update student's preferences in DB
    await Student.updateOne({ email: data.email }, { $set: { preferences: updatedPreferences } });

    let updatedCount = 0;

    for (const [index, pref] of updatedPreferences.entries()) {
      if (pref.isGroup && pref.partnerRollNumber) {
        // Find the partner student
        const partner = await Student.findOne({ roll_no: pref.partnerRollNumber });
        if (!partner) continue;

        // Find partner's matching preference
        const partnerPrefIndex = partner.preferences.findIndex(
          (p: Preference) => p.project.toString() === pref.project.toString() && p.partnerRollNumber === student.roll_no
        );

        if (partnerPrefIndex === -1 || partnerPrefIndex !== index) {
          // If partner has removed or changed preference, reset status for both
          await Student.updateMany(
            { roll_no: { $in: [student.roll_no, partner.roll_no] }, "preferences.project": pref.project },
            { $set: { "preferences.$.status": "Pending" } }
          );
        } else {
          // If both students match, update status to "Success"
          await Student.updateMany(
            { roll_no: { $in: [student.roll_no, partner.roll_no] }, "preferences.project": pref.project },
            { $set: { "preferences.$.status": "Success" } }
          );
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      message: updatedCount > 0
        ? "Preferences updated successfully, some statuses set to success"
        : "Preferences updated, status reset where needed",
      status: 200,
    });

  } catch (error) {
    console.error("Error updating student preferences:", error as Error);
    return NextResponse.json({ message: "Error updating preferences", error }, { status: 500 });
  }
}
