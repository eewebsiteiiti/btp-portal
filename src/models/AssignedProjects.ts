import mongoose from "mongoose";

const AssignedProjectsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    unique: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
});

export default mongoose.models.AssignedProjects ||
  mongoose.model("AssignedProjects", AssignedProjectsSchema);
