import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Connect to the database
    const db = await dbConnect();

    // Get all collection names
    if (!db.connection.db) {
      throw new Error("Database connection is undefined.");
    }
    const collections = await db.connection.db.listCollections().toArray();

    // Drop each collection
    for (const collection of collections) {
      await db.connection.db.dropCollection(collection.name);
    }

    return NextResponse.json({ message: "Database cleared successfully." });
  } catch (error) {
    console.error("Error clearing database:", error);
    return NextResponse.json(
      { message: "Failed to clear the database.", error },
      { status: 500 }
    );
  }
}
