import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  Domain: { type: String, required: true },
  Project_No: { type: String, required: true },
  Title : { type: String, required: true },
  Capacity: { type: Number, required: true },
  Nature_of_work: { type: String, required: true },
  Comments: { type: String, required: true },
  Supervisor: { type: String, required: true },
  Cosupervisor: { type: String, required: false },
});
export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
