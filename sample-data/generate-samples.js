const XLSX = require('xlsx');

// Sample Professors Data
// Required columns: name, email, password
const professors = [
  { name: "Dr. Rajesh Kumar", email: "rajesh.kumar@iiti.ac.in", password: "prof123" },
  { name: "Dr. Priya Sharma", email: "priya.sharma@iiti.ac.in", password: "prof123" },
  { name: "Dr. Amit Verma", email: "amit.verma@iiti.ac.in", password: "prof123" },
  { name: "Dr. Sunita Patel", email: "sunita.patel@iiti.ac.in", password: "prof123" },
  { name: "Dr. Vikram Singh", email: "vikram.singh@iiti.ac.in", password: "prof123" },
];

// Sample Students Data
// Required columns: roll_no, name, email
// Optional: cpi
const students = [
  { roll_no: "210001", name: "Rahul Gupta", email: "rahul.gupta@iiti.ac.in", cpi: 8.5 },
  { roll_no: "210002", name: "Sneha Reddy", email: "sneha.reddy@iiti.ac.in", cpi: 9.1 },
  { roll_no: "210003", name: "Arjun Nair", email: "arjun.nair@iiti.ac.in", cpi: 7.8 },
  { roll_no: "210004", name: "Pooja Mishra", email: "pooja.mishra@iiti.ac.in", cpi: 8.9 },
  { roll_no: "210005", name: "Karan Mehta", email: "karan.mehta@iiti.ac.in", cpi: 8.2 },
  { roll_no: "210006", name: "Ananya Singh", email: "ananya.singh@iiti.ac.in", cpi: 9.3 },
  { roll_no: "210007", name: "Rohan Joshi", email: "rohan.joshi@iiti.ac.in", cpi: 7.5 },
  { roll_no: "210008", name: "Divya Kapoor", email: "divya.kapoor@iiti.ac.in", cpi: 8.7 },
  { roll_no: "210009", name: "Siddharth Rao", email: "siddharth.rao@iiti.ac.in", cpi: 8.0 },
  { roll_no: "210010", name: "Meera Iyer", email: "meera.iyer@iiti.ac.in", cpi: 9.0 },
];

// Sample Projects Data
// Required columns: Domain, Project_No, Title, Capacity, Nature_of_work, Comments, Supervisor, Supervisor_email
// Optional: Cosupervisor
const projects = [
  {
    Domain: "Machine Learning",
    Project_No: "ML-001",
    Title: "Deep Learning for Medical Image Analysis",
    Capacity: 2,
    Nature_of_work: "Implementation and testing of CNN models for detecting diseases from X-ray images",
    Comments: "Prior experience with PyTorch/TensorFlow preferred",
    Supervisor: "Dr. Rajesh Kumar",
    Cosupervisor: "",
    Supervisor_email: "rajesh.kumar@iiti.ac.in"
  },
  {
    Domain: "Machine Learning",
    Project_No: "ML-002",
    Title: "Natural Language Processing for Sentiment Analysis",
    Capacity: 1,
    Nature_of_work: "Building NLP models for analyzing customer reviews",
    Comments: "Knowledge of transformers and BERT is a plus",
    Supervisor: "Dr. Rajesh Kumar",
    Cosupervisor: "Dr. Priya Sharma",
    Supervisor_email: "rajesh.kumar@iiti.ac.in"
  },
  {
    Domain: "Power Systems",
    Project_No: "PS-001",
    Title: "Smart Grid Optimization using AI",
    Capacity: 2,
    Nature_of_work: "Developing algorithms for optimal power distribution in smart grids",
    Comments: "Strong background in power systems required",
    Supervisor: "Dr. Priya Sharma",
    Cosupervisor: "",
    Supervisor_email: "priya.sharma@iiti.ac.in"
  },
  {
    Domain: "VLSI Design",
    Project_No: "VLSI-001",
    Title: "Low Power SRAM Design",
    Capacity: 1,
    Nature_of_work: "Design and simulation of low-power SRAM cells using Cadence tools",
    Comments: "Experience with Cadence Virtuoso required",
    Supervisor: "Dr. Amit Verma",
    Cosupervisor: "",
    Supervisor_email: "amit.verma@iiti.ac.in"
  },
  {
    Domain: "VLSI Design",
    Project_No: "VLSI-002",
    Title: "FPGA Implementation of Signal Processing Algorithms",
    Capacity: 2,
    Nature_of_work: "Implementing DSP algorithms on FPGA using Verilog/VHDL",
    Comments: "Knowledge of digital signal processing required",
    Supervisor: "Dr. Amit Verma",
    Cosupervisor: "Dr. Sunita Patel",
    Supervisor_email: "amit.verma@iiti.ac.in"
  },
  {
    Domain: "Control Systems",
    Project_No: "CS-001",
    Title: "Autonomous Vehicle Path Planning",
    Capacity: 2,
    Nature_of_work: "Developing path planning algorithms for autonomous vehicles",
    Comments: "Programming skills in Python/C++ required",
    Supervisor: "Dr. Sunita Patel",
    Cosupervisor: "",
    Supervisor_email: "sunita.patel@iiti.ac.in"
  },
  {
    Domain: "Communication Systems",
    Project_No: "COM-001",
    Title: "5G Network Simulation and Analysis",
    Capacity: 1,
    Nature_of_work: "Simulation of 5G networks using MATLAB/NS3",
    Comments: "Good understanding of wireless communication required",
    Supervisor: "Dr. Vikram Singh",
    Cosupervisor: "",
    Supervisor_email: "vikram.singh@iiti.ac.in"
  },
  {
    Domain: "Communication Systems",
    Project_No: "COM-002",
    Title: "IoT Security Framework Development",
    Capacity: 2,
    Nature_of_work: "Designing security protocols for IoT devices",
    Comments: "Interest in cybersecurity is preferred",
    Supervisor: "Dr. Vikram Singh",
    Cosupervisor: "Dr. Rajesh Kumar",
    Supervisor_email: "vikram.singh@iiti.ac.in"
  },
];

// Create workbooks and save as .xlsx files
function createExcelFile(data, filename) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
  console.log(`Created: ${filename}`);
}

createExcelFile(professors, './sample-data/professors.xlsx');
createExcelFile(students, './sample-data/students.xlsx');
createExcelFile(projects, './sample-data/projects.xlsx');

console.log('\nSample Excel files created successfully!');
console.log('\nUpload order (recommended):');
console.log('1. projects.xlsx (first, so professor links work)');
console.log('2. professors.xlsx (links to projects via email)');
console.log('3. students.xlsx (creates preferences for all projects)');
