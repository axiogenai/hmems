// Universal Demo Data Generator for All Classes
// Generates realistic dummy rosters (stud1...stud15), timetables, assignments, and 1-week progress tracking

export const ALL_CLASSES_LIST = [
  "Nursery", "LKG", "UKG",
  "Class I-A", "Class I-B", "Class II-A", "Class II-B",
  "Class III-A", "Class III-B", "Class IV-A", "Class IV-B",
  "Class V-A", "Class V-B", "Class VI-A", "Class VI-B",
  "Class VII-A", "Class VII-B", "Class VIII-A", "Class VIII-B",
  "Class IX-A", "Class IX-B", "Class X-A", "Class X-B"
];

export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DEFAULT_SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Hindi", "Computer Science", "Physical Education", "Art & Craft"];

// 1. Generate Students for EVERY class (stud1, stud2, ... stud15 per class)
export function generateDemoStudents() {
  const students: any[] = [];
  let globalId = 1;

  ALL_CLASSES_LIST.forEach((cls) => {
    const cleanClass = cls.replace(/^Class\s+/i, "").trim();
    for (let i = 1; i <= 15; i++) {
      students.push({
        id: globalId,
        rollNo: i,
        name: `stud${i} (${cleanClass})`,
        grade: cls,
        parentName: `Parent of stud${i}`,
        parentEmail: `parent.stud${i}.${cleanClass.toLowerCase().replace(/\s+/g, '')}@school.com`,
        parentPhone: `+91 98765 ${10000 + globalId}`,
        status: "Active",
        registeredAt: "2026-06-15"
      });
      globalId++;
    }
  });

  return students;
}

// 2. Generate Complete Weekly Timetables for EVERY class
export function generateDemoTimetables() {
  const timetables: Record<string, any> = {};

  const periods = [
    { period: 1, startTime: "08:30 AM", endTime: "09:15 AM" },
    { period: 2, startTime: "09:15 AM", endTime: "10:00 AM" },
    { period: 3, startTime: "10:00 AM", endTime: "10:45 AM" },
    { period: 4, startTime: "11:15 AM", endTime: "12:00 PM" },
    { period: 5, startTime: "12:00 PM", endTime: "12:45 PM" },
    { period: 6, startTime: "01:30 PM", endTime: "02:15 PM" },
    { period: 7, startTime: "02:15 PM", endTime: "03:00 PM" }
  ];

  ALL_CLASSES_LIST.forEach((cls) => {
    const classSchedule: Record<string, any> = {};
    DAYS_OF_WEEK.forEach((day, dIdx) => {
      periods.forEach((p, pIdx) => {
        const key = `${day}-${p.period}`;
        const subjIdx = (dIdx + pIdx) % DEFAULT_SUBJECTS.length;
        classSchedule[key] = {
          subject: DEFAULT_SUBJECTS[subjIdx],
          teacherName: `Teacher ${(subjIdx % 5) + 1}`,
          room: subjIdx % 3 === 0 ? "Science Lab" : subjIdx % 4 === 0 ? "Comp Lab" : "Classroom",
          startTime: p.startTime,
          endTime: p.endTime
        };
      });
    });
    timetables[cls] = classSchedule;
  });

  return timetables;
}

// 3. Generate Assignments for EVERY class
export function generateDemoAssignments() {
  const assignments: Record<string, any[]> = {};

  ALL_CLASSES_LIST.forEach((cls) => {
    DEFAULT_SUBJECTS.forEach((subj) => {
      const key = `${cls}__${subj}`;
      assignments[key] = [
        {
          id: `asgn-1-${key}`,
          title: `Weekly Assignment 1 — ${subj}`,
          dueDate: "2026-07-25",
          submitted: 12,
          total: 15,
          status: "Active"
        },
        {
          id: `asgn-2-${key}`,
          title: `Unit Practice Quiz — ${subj}`,
          dueDate: "2026-07-28",
          submitted: 9,
          total: 15,
          status: "Active"
        },
        {
          id: `asgn-3-${key}`,
          title: `1-Week Progress Homework — ${subj}`,
          dueDate: "2026-07-20",
          submitted: 15,
          total: 15,
          status: "Completed"
        }
      ];
    });
  });

  return assignments;
}

// 4. Generate 1-Week Progress & Attendance Metrics for EVERY student
export function generateDemoProgress() {
  const progress: Record<string, any> = {};

  ALL_CLASSES_LIST.forEach((cls) => {
    const roster = Array.from({ length: 15 }, (_, i) => i + 1);

    roster.forEach((studNum) => {
      const studId = `stud${studNum}`;
      // 1-Week Attendance (7 days)
      const weeklyAttendance = [true, true, true, false, true, true, true]; // 6/7 days present (85.7%)
      const testScores = {
        unitTest1: 80 + (studNum % 15),
        unitTest2: 85 + ((studNum * 2) % 12),
        assignmentAvg: 88 + (studNum % 10)
      };
      const avgScore = Math.round((testScores.unitTest1 + testScores.unitTest2 + testScores.assignmentAvg) / 3);

      progress[`${cls}-${studId}`] = {
        studentName: `stud${studNum}`,
        classId: cls,
        attendanceRate: "85.7%",
        presentDays: 6,
        totalDays: 7,
        weeklyAttendanceLog: weeklyAttendance,
        testScores,
        overallProgressPct: avgScore,
        grade: avgScore >= 90 ? "A+" : avgScore >= 80 ? "A" : "B+"
      };
    });
  });

  return progress;
}
