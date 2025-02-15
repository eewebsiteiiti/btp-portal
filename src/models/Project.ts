import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  domain: { type: String, required: true },
  description: { type: String, required: true },
  capacity: { type: Number, enum:[1, 2], required: true },
  supervisor: { type: String, required: true },
  cosupervisor: { type: String, required: false },
  student: { type: Array, required: false },
});

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
