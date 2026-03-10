const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, isTeacher, isStudent } = require('../middleware/authMiddleware');

// All course routes require authentication
router.use(verifyToken);

// Teacher routes
router.post('/create', isTeacher, courseController.createCourse);
router.get('/teacher-courses', isTeacher, courseController.getTeacherCourses);

// Student routes
router.post('/join', isStudent, courseController.joinCourse);
router.get('/student-courses', isStudent, courseController.getStudentCourses);

module.exports = router;
