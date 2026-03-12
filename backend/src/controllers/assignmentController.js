const db = require('../config/db');
const crypto = require('crypto');

// Create an assignment (Teacher only)
exports.createAssignment = async (req, res) => {
    try {
        const { course_id, title, description, deadline, max_marks } = req.body;
        const assignmentId = crypto.randomUUID();
        const file_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!course_id || !title || !due_date || !max_marks) {
            return res.status(400).json({ message: 'Title, due date, and max marks are required' });
        }

        await db.execute(
            'INSERT INTO assignments (id, course_id, title, description, due_date, max_marks, file_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [assignmentId, course_id, title, description, due_date, max_marks, file_url]
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
            'SELECT *, due_date as deadline FROM assignments WHERE course_id = ? ORDER BY due_date ASC',
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

        // Check if the assignment exists and due_date
        const [assignments] = await db.execute('SELECT due_date FROM assignments WHERE id = ?', [assignment_id]);
        if (assignments.length === 0) return res.status(404).json({ message: 'Assignment not found' });

        // Insert or update submission
        // Using file_path (which is NOT NULL) and file_url for compatibility
        await db.execute(
            `INSERT INTO submissions (id, assignment_id, student_id, file_path, file_url) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), file_url = VALUES(file_url), submitted_at = CURRENT_TIMESTAMP`,
            [submissionId, assignment_id, student_id, file_url, file_url]
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
            `SELECT s.*, u.name as student_name, s.grade as marks 
       FROM submissions s 
       JOIN users u ON s.student_id = u.id 
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
        const { submission_id, grade, feedback } = req.body;

        await db.execute(
            `UPDATE submissions SET grade = ?, feedback = ? WHERE id = ?`,
            [grade, feedback, submission_id]
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
            `SELECT a.id as assignment_id, s.id as submission_id, s.file_url, s.submitted_at, s.grade as marks, s.feedback, a.due_date as deadline 
             FROM assignments a 
             LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ? 
             WHERE a.course_id = ?`,
            [student_id, course_id]
        );

        res.json(submissions);
    } catch (error) {
        console.error('Fetch Student Submissions Error:', error);
        res.status(500).json({ message: 'Server error fetching your submissions' });
    }
};
