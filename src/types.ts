// Database model types (matching Prisma schema)
export interface ProfessorI {
  id: string;
  name: string;
  email: string;
  password: string;
  studentsPreference: Record<string, string[][]>;
  studentLimit: number;
  submitStatus: boolean;
  mtpSubmitStatus: boolean;
  mtpStudentsPreference: Record<string, string[][]>;
  projects?: ProjectI[];
}

export interface PreferenceI {
  id: string;
  projectId: string;
  project?: ProjectI;
  isGroup: boolean;
  partnerRollNumber: string;
  status: "Pending" | "Success";
  orderIndex: number;
}

export interface StudentI {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  password: string;
  preferences: PreferenceI[];
  submitStatus: boolean;
  cpi: number | null;
  program: string;
  domain?: string | null;
}

export interface ProjectI {
  id: string;
  domain: string;
  projectNo: string;
  title: string;
  capacity: number;
  natureOfWork: string;
  comments: string;
  supervisor: string;
  cosupervisor?: string | null;
  supervisorEmail: string;
  dropProject: boolean;
  program: string;
  professorId?: string | null;
  professor?: { id: string; name: string; email: string } | null;
}

export interface AssignedProjectI {
  id: string;
  studentId: string;
  projectId: string;
  student?: StudentI;
  project?: ProjectI;
}

export interface ControlsI {
  id?: string;
  submitEnableStudentProjects: boolean;
  submitEnableProfessorStudents: boolean;
  projectViewEnableStudent: boolean;
  studentViewEnableProfessor: boolean;
  studentViewResult: boolean;
  professorViewResult: boolean;
  minCapacity: number;
  maxCapacity: number;
}

export interface MtpControlsI extends ControlsI {
  domain: string;
}

export interface ProgramCoordinatorI {
  id: string;
  name: string;
  email: string;
  password: string;
  domain: string;
}

export interface UserI {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "professor" | "student" | "mtp_student" | "dpgc" | "program_coordinator";
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

// API Response types
export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  error?: string;
}

export interface StudentCreateInput {
  rollNo: string;
  name: string;
  email: string;
  cpi?: number;
  program?: string;
  domain?: string;
}

export interface ProfessorCreateInput {
  name: string;
  email: string;
  password: string;
}

export interface ProjectCreateInput {
  domain: string;
  projectNo: string;
  title: string;
  capacity: number;
  natureOfWork: string;
  comments: string;
  supervisor: string;
  cosupervisor?: string;
  supervisorEmail: string;
  program?: string;
}
