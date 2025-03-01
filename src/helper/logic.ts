type ProfessorProjectMap = { [key: number]: number };
type ProfessorLimitMap = { [key: number]: number };
type ProfessorStudentMap = { [key: number]: number[][] };

type AssignmentResult = { student: number; project: number }[];

const projects = Array.from({ length: 7 }, (_, i) => i + 1);
const profProject: ProfessorProjectMap = { 0: 0, 1: 0, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2 };
const professorLimits: ProfessorLimitMap = { 0: 2, 1: 2, 2: 2 };
const profStudentMap: ProfessorStudentMap = { 0: [], 1: [], 2: [] };
let profAssigned: ProfessorLimitMap = { 0: 0, 1: 0, 2: 0 };

const studentPreferences = [
    [1, 2, 3, 4, 5, 6, 7],
    [4, 5, 6, 1, 2, 3, 7],
    [2, 1, 3, 4, 5, 6, 7],
    [4, 5, 3, 2, 1, 6, 7],
    [6, 7, 1, 2, 3, 4, 5],
];

const professorPreferences = [
    [1, 2, 4, 5, 4, 5, 1],
    [3, 3, 5, 1, 2, 1, 3],
    [2, 1, 2, 4, 4, 4, 4],
    [4, 4, 3, 2, 1, 3, 5],
    [5, 5, 1, 3, 3, 2, 2],
];

let resultMatrix = studentPreferences.map((row, i) =>
    row.map((val, j) => val + professorPreferences[i][j])
);

const assignProjects = (): AssignmentResult => {
    let finalMapping: AssignmentResult = [];

    while (new Set(resultMatrix.flat()).size !== 1) {
        const minVal = Math.min(...resultMatrix.flat());
        let indices: number[][] = [];

        resultMatrix.forEach((row, i) =>
            row.forEach((val, j) => {
                if (val === minVal) indices.push([i, j]);
            })
        );

        let assignedRows = new Set<number>();
        let chosenAssignments: number[][] = [];

        indices.forEach(([i, j]) => {
            if (!assignedRows.has(i)) {
                assignedRows.add(i);
                chosenAssignments.push([i, j]);
            }
        });

        for (const [i, j] of chosenAssignments) {
            const professor = profProject[j];
            if (profAssigned[professor] < professorLimits[professor]) {
                finalMapping.push({ student: i, project: j });
                profStudentMap[professor].push([i, j]);
                profAssigned[professor]++;
            }

            resultMatrix[i] = resultMatrix[i].map(() => 1e5);
            resultMatrix.forEach(row => row[j] = 1e5);
        }
    }
    return finalMapping;
};

console.log(assignProjects());
