const db = require('../config/db');
const crypto = require('crypto');

// Create an assignment (Teacher only)
exports.createAssignment = async (req, res) => {
    try {
        const { course_id, title, description, deadline, max_marks } = req.body;
        const assignmentId = crypto.randomUUID();
        const file_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!course_id || !title || !deadline || !max_marks) {
            return res.status(400).json({ message: 'Title, deadline, and max marks are required' });
        }

        await db.execute(
            'INSERT INTO assignments (id, course_id, title, description, deadline, max_marks, file_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [assignmentId, course_id, title, description, deadline, max_marks, file_url]
        );

        res.status(201).json({ message: 'Assignment created successfully', id: assignmentId });
    } catch (error) {
        console.error('Create Assignment Error:', error);
        res.status(500).json({ message: 'Server error while creating assignment' });
    }
};

// Get all assignments for a course
exports.getCourseAssignments = async (req, res) => {
    try {
        const { course_id } = req.params;
        const [assignments] = await db.execute(
            'SELECT * FROM assignments WHERE course_id = ? ORDER BY deadline ASC',
            [course_id]
        );
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching assignments' });
    }
};

// Submit an assignment (Student only)
exports.submitAssignment = async (req, res) => {
    try {
        const { assignment_id } = req.body;
        const student_id = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const file_url = `/uploads/${req.file.filename}`;
        const submissionId = crypto.randomUUID();

        // Check if the assignment exists and deadline
        const [assignments] = await db.execute('SELECT deadline FROM assignments WHERE id = ?', [assignment_id]);
        if (assignments.length === 0) return res.status(404).json({ message: 'Assignment not found' });

        const deadline = new Date(assignments[0].deadline);
        const status = new Date() > deadline ? 'late' : 'submitted';

        // Insert or update submission
        await db.execute(
            `INSERT INTO submissions (id, assignment_id, student_id, file_url, status) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), status = VALUES(status), submitted_at = CURRENT_TIMESTAMP`,
            [submissionId, assignment_id, student_id, file_url, status]
        );

        res.status(200).json({ message: 'Assignment submitted successfully', status });
    } catch (error) {
        console.error('Submission Error:', error);
        res.status(500).json({ message: 'Server error during submission' });
    }
};

// Get submissions for an assignment (Teacher only)
exports.getSubmissions = async (req, res) => {
    try {
        const { assignment_id } = req.params;
        const [submissions] = await db.execute(
            `SELECT s.*, u.name as student_name, g.marks, g.feedback 
       FROM submissions s 
       JOIN users u ON s.student_id = u.id 
       LEFT JOIN grades g ON s.id = g.submission_id 
       WHERE s.assignment_id = ?`,
            [assignment_id]
        );
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching submissions' });
    }
};

// Grade a submission (Teacher only)
exports.gradeSubmission = async (req, res) => {
    try {
        const { submission_id, marks, feedback } = req.body;
        const teacher_id = req.user.id;
        const gradeId = crypto.randomUUID();

        await db.execute(
            `INSERT INTO grades (id, submission_id, teacher_id, marks, feedback) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE marks = VALUES(marks), feedback = VALUES(feedback), graded_at = CURRENT_TIMESTAMP`,
            [gradeId, submission_id, teacher_id, marks, feedback]
        );

        res.json({ message: 'Submission graded successfully' });
    } catch (error) {
        console.error('Grading Error:', error);
        res.status(500).json({ message: 'Server error while grading' });
    }
};

// Get a student's submissions for a course (Student only)
exports.getStudentSubmissions = async (req, res) => {
    try {
        const { course_id } = req.params;
        const student_id = req.user.id;

        const [submissions] = await db.execute(
            `SELECT a.id as assignment_id, s.id as submission_id, s.status, s.file_url, s.submitted_at, g.marks, g.feedback 
             FROM assignments a 
             LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ? 
             LEFT JOIN grades g ON s.id = g.submission_id 
             WHERE a.course_id = ?`,
            [student_id, course_id]
        );

        res.json(submissions);
    } catch (error) {
        console.error('Fetch Student Submissions Error:', error);
        res.status(500).json({ message: 'Server error fetching your submissions' });
    }
};
