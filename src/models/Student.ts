import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  roll_no: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Todo: Hash the password
  cpi: { type: Number, required: true },
  preference: { type: Array, required: false },
});

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
