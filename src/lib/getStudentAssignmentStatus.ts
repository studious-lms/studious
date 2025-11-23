import { AssignmentGetOutput } from "./types";

export type Status = 'Late' | 'Submitted' | 'Returned' | 'Pending' | 'Missing' | 'Graded';

export const getStudentAssignmentStatus = (assignment: AssignmentGetOutput): Status[] => {
    const result: Status[] = [];
    const late = assignment.late;

    if (assignment.late) {
        result.push("Late");
    }
    if (assignment.submitted) {
        result.push("Submitted");
    }
    if (assignment.returned) {
        result.push("Returned");
    }

    if (result.length == 0 && !late) {
        return ["Pending"];
    } else if (result.length == 0
        && late
    ) {
        return ["Missing"];
    }
    

    return result;
}

export const getStatusColor = (status: Status) => {
    switch (status) {
        case "Late": 
            return "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors";
        case "Submitted": 
            return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors";
        case "Returned": 
            return "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors";
        case "Pending": 
            return "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors";
        case "Missing": 
            return "bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-950/50 transition-colors";
        case "Graded": 
            return "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors";
    }
}