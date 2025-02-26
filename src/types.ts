export interface ProfessorI {
  _id: string;
  name: string;
  email: string;
  password: string;
  students: StudentI[];
  projects: ProjectI[];
}
export interface StudentI {
  _id: string;
  roll_no: string;
  name: string;
  email: string;
  password: string;
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
}

export interface PreferenceI{
  project: ProjectI;
  isGroup: boolean;
  partner?: StudentI;
}