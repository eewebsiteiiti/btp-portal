import mongoose from "mongoose";

const ProfessorSchema = new mongoose.Schema({
  faculty_id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Todo: Hash the password
  preference: { type: Array, required: false },
});

export default mongoose.models.Professor || mongoose.model("Professor", ProfessorSchema);
