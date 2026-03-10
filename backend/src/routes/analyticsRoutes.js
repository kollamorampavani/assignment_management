const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Teacher Analytics
router.get('/assignment/:assignment_id', isTeacher, analyticsController.getAssignmentAnalytics);
router.get('/dashboard-stats', isTeacher, analyticsController.getTeacherDashboardStats);

// Student Analytics
router.get('/student-stats', analyticsController.getStudentDashboardStats);

module.exports = router;
