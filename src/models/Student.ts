import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  roll_no: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Todo: Hash the password
  preferences : [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
});

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
