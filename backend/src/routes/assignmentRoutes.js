const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { verifyToken, isTeacher, isStudent } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUpload');

// Authenticated routes
router.use(verifyToken);

// Teacher routes
router.post('/create', isTeacher, upload.single('file'), assignmentController.createAssignment);
router.get('/submissions/:assignment_id', isTeacher, assignmentController.getSubmissions);
router.post('/grade', isTeacher, assignmentController.gradeSubmission);

// Shared/Student routes
router.get('/course/:course_id', assignmentController.getCourseAssignments);
router.get('/my-submissions/:course_id', isStudent, assignmentController.getStudentSubmissions);
router.post('/submit', isStudent, upload.single('file'), assignmentController.submitAssignment);

module.exports = router;
