const cron = require('node-cron');
const db = require('../config/db');
const crypto = require('crypto');
const { sendReminders } = require('../services/reminderService');

const initScheduler = () => {
    // Run every hour to check for deadlines approaching in the next 24 hours
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Running Deadline Reminder Task...');

        try {
            // Find assignments with due_date between CURRENT_TIMESTAMP and CURRENT_TIMESTAMP + 24 HOURS
            const [assignments] = await db.execute(`
                SELECT id, title, due_date, course_id
                FROM assignments
                WHERE due_date >= DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 23 HOUR)
                AND due_date <= DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR)
            `);

            for (const assignment of assignments) {
                // Find students in this course
                const [students] = await db.execute(
                    'SELECT student_id FROM enrollments WHERE course_id = ?',
                    [assignment.course_id]
                );

                for (const student of students) {
                    // Check if student already submitted
                    const [submitted] = await db.execute(
                        'SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?',
                        [assignment.id, student.student_id]
                    );

                    if (submitted.length === 0) {
                        const message = `Reminder: Assignment '${assignment.title}' is due within 24 hours!`;

                        // Check if notification already sent for this assignment/user
                        const [existingNote] = await db.execute(
                            'SELECT * FROM notifications WHERE user_id = ? AND message = ?',
                            [student.student_id, message]
                        );

                        if (existingNote.length === 0) {
                            await db.execute(
                                'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
                                [student.student_id, message]
                            );
                            console.log(`🔔 Notification sent to student ${student.student_id} for ${assignment.title}`);
                        }
                    }
                }
            }

            // Also trigger the external email reminder service
            await sendReminders();

        } catch (error) {
            console.error('Scheduler Error:', error);
        }
    });
};

module.exports = initScheduler;
