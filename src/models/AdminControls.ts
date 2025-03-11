import mongoose from "mongoose";

const AdminControlsSchema = new mongoose.Schema({
  submitEnableStudentProjects: {
    type: Boolean,
    required: true,
    default: false,
  },
  submitEnableProfessorStudents: {
    type: Boolean,
    required: true,
    default: false,
  },
  projectViewEnableStudent: {
    type: Boolean,
    required: true,
    default: false,
  },
  studentViewEnableProfessor: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default mongoose.models.AdminControls ||
  mongoose.model("AdminControls", AdminControlsSchema);
