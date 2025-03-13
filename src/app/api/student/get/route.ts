import { NextResponse, NextRequest } from "next/server";
import Student from "@/models/Student";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const students = await Student.find({});

    for (const student of students) {
      if (!student.preferences) continue;

      for (const [index, preference] of student.preferences.entries()) {
        if (preference.isGroup && preference.partnerRollNumber) {
          const partner = await Student.findOne({
            roll_no: preference.partnerRollNumber,
          });
          if (partner && partner.preferences) {
            interface Preference {
              project: string;
              isGroup: boolean;
              partnerRollNumber?: string;
              status?: string;
            }
            const partner_preference_index: number =
              partner.preferences.findIndex(
                (p: Preference) =>
                  p.project.toString() === preference.project.toString()
              );

            if (partner_preference_index !== -1) {
              if (
                partner_preference_index === index &&
                partner.preferences[index].isGroup
              ) {
                preference.status = "Success";
                partner.preferences[partner_preference_index].status =
                  "Success";
              } else {
                preference.status = "Pending";
                partner.preferences[partner_preference_index].status =
                  "Pending";
              }

              await student.save();
              await partner.save();
            }
          }
        }
      }
    }

    // Handle email-based filtering
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (email) {
      const student = await Student.findOne({ email });
      return NextResponse.json(
        { message: "GET request received", student },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "GET request received", students },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
