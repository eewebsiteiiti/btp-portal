import mongoose from "mongoose";

const ProfessorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Todo: Hash the password
  studentsPreference: {
    type: Map,
    of: [[{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]],
    default: {},
  },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  studentLimit: { type: Number, default: 4 },
});

export default mongoose.models.Professor ||
  mongoose.model("Professor", ProfessorSchema);
