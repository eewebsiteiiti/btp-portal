import mongoose from "mongoose";

const ProfessorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Todo: Hash the password
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
});

export default mongoose.models.Professor || mongoose.model("Professor", ProfessorSchema);
