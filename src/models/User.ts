import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "professor", "student"], default: "student" },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
