import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    controlProfessorSubmission: { type: Boolean, required: true },
    controlStudentSubmission: { type: Boolean, required: true }
});

export default mongoose.models.Admin ||
    mongoose.model("Admin", AdminSchema);
