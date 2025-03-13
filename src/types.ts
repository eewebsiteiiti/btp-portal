export interface ProfessorI {
  _id: string;
  name: string;
  email: string;
  password: string;
  // students: StudentI[];
  studentsPreference?: { [key: string]: string[] };
  projects: string[];
  submitStatus: boolean;
}
export interface PreferenceI {
  project: string;
  isGroup: boolean;
  preferences: string;
  status: "Pending" | "Success";
  partnerRollNumber: string;
}
export interface StudentI {
  _id: string;
  roll_no: string;
  name: string;
  email: string;
  password: string;
  preferences: PreferenceI[];
  submitStatus: boolean;
}
export interface ProjectI {
  Domain: string;
  _id: string;
  Project_No: string;
  Title: string;
  Capacity: number;
  Nature_of_work: string;
  Comments: string;
  Supervisor: string;
  Cosupervisor?: string;
  studentLimit: number;
  Supervisor_email: string;
}
export interface ControlsI {
  submitEnableStudentProjects: boolean;
  submitEnableProfessorStudents: boolean;
  projectViewEnableStudent: boolean;
  studentViewEnableProfessor: boolean;
}
export interface UserI {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "professor" | "student";
}

export interface SortableItemProps {
  id: string;
  project: ProjectI;
  index?: number;
  isOverlay?: boolean;
  setProjectMap: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { partnerRollNumber: string; status: string };
    }>
  >;
  projectMap: { [key: string]: { partnerRollNumber: string; status: string } };
  student: StudentI;
}
