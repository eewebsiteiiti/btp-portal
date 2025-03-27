import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  roll_no: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Todo: Hash the password
  preferences: [
    {
      project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
      isGroup: { type: Boolean, default: false },
      partnerRollNumber: { type: String, default: "" },
      status: { type: String, default: "Pending" },
    },
  ],
  submitStatus: { type: Boolean, required: true, default: false },
  cpi: { type: Number, required: false },
});

export default mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);
