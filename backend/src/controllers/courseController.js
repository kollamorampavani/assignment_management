const db = require('../config/db');
const crypto = require('crypto');

// Create a new course (Teacher only)
exports.createCourse = async (req, res) => {
    try {
        const { name, description } = req.body;
        const teacher_id = req.user.id;

        if (!name) {
            return res.status(400).json({ message: 'Course name is required' });
        }

        // Generate a unique 6-character alphanumeric join code
        const join_code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const courseId = crypto.randomUUID();

        await db.execute(
            'INSERT INTO courses (id, name, description, teacher_id, join_code) VALUES (?, ?, ?, ?, ?)',
            [courseId, name, description, teacher_id, join_code]
        );

        res.status(201).json({
            message: 'Course created successfully',
            course: { id: courseId, name, join_code }
        });
    } catch (error) {
        console.error('Create Course Error:', error);
        res.status(500).json({ message: 'Server error while creating course' });
    }
};

// Join a course using join code (Student only)
exports.joinCourse = async (req, res) => {
    try {
        const { join_code } = req.body;
        const student_id = req.user.id;

        if (!join_code) {
            return res.status(400).json({ message: 'Join code is required' });
        }

        // Find course by join code
        const [courses] = await db.execute('SELECT id FROM courses WHERE join_code = ?', [join_code]);
        if (courses.length === 0) {
            return res.status(404).json({ message: 'Invalid join code' });
        }

        const course_id = courses[0].id;

        // Check if already enrolled
        const [existing] = await db.execute(
            'SELECT * FROM course_enrollments WHERE student_id = ? AND course_id = ?',
            [student_id, course_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }

        // Enroll student
        const enrollmentId = crypto.randomUUID();
        await db.execute(
            'INSERT INTO course_enrollments (id, student_id, course_id) VALUES (?, ?, ?)',
            [enrollmentId, student_id, course_id]
        );

        res.status(200).json({ message: 'Joined course successfully' });
    } catch (error) {
        console.error('Join Course Error:', error);
        res.status(500).json({ message: 'Server error while joining course' });
    }
};

// Get all courses created by the teacher
exports.getTeacherCourses = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const [courses] = await db.execute('SELECT * FROM courses WHERE teacher_id = ?', [teacher_id]);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching courses' });
    }
};

// Get all courses joined by the student
exports.getStudentCourses = async (req, res) => {
    try {
        const student_id = req.user.id;
        const [courses] = await db.execute(
            `SELECT c.* FROM courses c 
       JOIN course_enrollments ce ON c.id = ce.course_id 
       WHERE ce.student_id = ?`,
            [student_id]
        );
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching joined courses' });
    }
};
