const db = require('../config/db');

// Get analytics for a specific assignment
exports.getAssignmentAnalytics = async (req, res) => {
    try {
        const { assignment_id } = req.params;

        // 1. Get Course ID and Total Students Enrolled
        const [assignmentInfo] = await db.execute(
            'SELECT course_id, max_marks FROM assignments WHERE id = ?',
            [assignment_id]
        );

        if (assignmentInfo.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const { course_id, max_marks } = assignmentInfo[0];

        const [enrollmentInfo] = await db.execute(
            'SELECT COUNT(*) as total_students FROM enrollments WHERE course_id = ?',
            [course_id]
        );

        const totalStudents = enrollmentInfo[0].total_students;

        // 2. Get Submissions Stats
        const [submissionStats] = await db.execute(
            `SELECT 
        COUNT(*) as total_submissions,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_submissions
       FROM submissions WHERE assignment_id = ?`,
            [assignment_id]
        );

        const totalSubmissions = submissionStats[0].total_submissions;
        const lateSubmissions = submissionStats[0].late_submissions;

        // 3. Get Grading Stats (Average Marks)
        const [gradingStats] = await db.execute(
            `SELECT AVG(grade) as avg_marks FROM submissions
             WHERE assignment_id = ? AND grade IS NOT NULL`,
            [assignment_id]
        );

        const averageMarks = gradingStats[0].avg_marks || 0;

        res.json({
            assignment_id,
            totalStudents,
            totalSubmissions,
            pendingSubmissions: totalStudents - totalSubmissions,
            lateSubmissions,
            averageMarks: parseFloat(averageMarks).toFixed(2),
            maxMarks: max_marks
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
};

// Get Teacher Dashboard Overview
exports.getTeacherDashboardStats = async (req, res) => {
    try {
        const teacher_id = req.user.id;

        const [courses] = await db.execute('SELECT COUNT(*) as count FROM courses WHERE teacher_id = ?', [teacher_id]);
        const [assignments] = await db.execute(
            'SELECT COUNT(*) as count FROM assignments a JOIN courses c ON a.course_id = c.id WHERE c.teacher_id = ?',
            [teacher_id]
        );
        const [students] = await db.execute(
            'SELECT COUNT(DISTINCT student_id) as count FROM enrollments ce JOIN courses c ON ce.course_id = c.id WHERE c.teacher_id = ?',
            [teacher_id]
        );

        // Submissions without grades
        const [pending] = await db.execute(
            `SELECT COUNT(*) as count FROM submissions s 
             JOIN assignments a ON s.assignment_id = a.id 
             JOIN courses c ON a.course_id = c.id 
             WHERE c.teacher_id = ? AND s.grade IS NULL`,
            [teacher_id]
        );

        res.json({
            totalCourses: courses[0].count,
            totalAssignments: assignments[0].count,
            totalStudents: students[0].count,
            pendingGrading: pending[0].count
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};

// Get Student Dashboard Overview
exports.getStudentDashboardStats = async (req, res) => {
    try {
        const student_id = req.user.id;

        // 1. Enrolled Courses
        const [courses] = await db.execute('SELECT COUNT(*) as count FROM enrollments WHERE student_id = ?', [student_id]);

        // 2. Total Assignments in enrolled courses
        const [totalAssignments] = await db.execute(
            `SELECT COUNT(*) as count FROM assignments a 
             JOIN enrollments ce ON a.course_id = ce.course_id 
             WHERE ce.student_id = ?`,
            [student_id]
        );

        // 3. Completed Assignments (Submissions)
        const [completedSubmissions] = await db.execute(
            'SELECT COUNT(*) as count FROM submissions WHERE student_id = ?',
            [student_id]
        );

        // 4. Average Grade
        const [avgGrade] = await db.execute(
            `SELECT AVG(grade) as avg FROM submissions 
             WHERE student_id = ? AND grade IS NOT NULL`,
            [student_id]
        );

        // 5. Upcoming Assignments (not submitted and deadline not passed)
        const [upcoming] = await db.execute(
            `SELECT COUNT(*) as count FROM assignments a 
             JOIN enrollments ce ON a.course_id = ce.course_id 
             LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ? 
             WHERE ce.student_id = ? AND s.id IS NULL AND a.due_date > NOW()`,
            [student_id, student_id]
        );

        res.json({
            enrolledCourses: courses[0].count,
            upcomingTasks: upcoming[0].count,
            completedTasks: completedSubmissions[0].count,
            averageGrade: avgGrade[0].avg ? parseFloat(avgGrade[0].avg).toFixed(1) : 'N/A'
        });
    } catch (error) {
        console.error('Student Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching student stats' });
    }
};
