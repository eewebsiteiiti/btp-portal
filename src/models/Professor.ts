import mongoose from "mongoose";

const ProfessorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Todo: Hash the password
  students: [{ type: String }],
  projects: [{ type: String }],
});

export default mongoose.models.Professor || mongoose.model("Professor", ProfessorSchema);
