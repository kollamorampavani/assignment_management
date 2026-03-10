const cron = require('node-cron');
const nodemailer = require('nodemailer');
const db = require('../config/db');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendReminders = async () => {
    try {
        console.log('Running assignment reminder job...');

        // Find assignments due in the next 24 hours
        // and find students enrolled in those courses who haven't submitted yet
        const [reminders] = await db.execute(`
            SELECT 
                u.email, 
                u.name as student_name, 
                a.title as assignment_title, 
                a.deadline,
                c.name as course_name
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            JOIN course_enrollments ce ON c.id = ce.course_id
            JOIN users u ON ce.student_id = u.id
            LEFT JOIN submissions s ON a.id = s.assignment_id AND u.id = s.student_id
            WHERE 
                s.id IS NULL 
                AND a.deadline >= DATE_ADD(NOW(), INTERVAL 23 HOUR)
                AND a.deadline <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
        `);

        console.log(`Found ${reminders.length} students to remind.`);

        for (const r of reminders) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: r.email,
                subject: `Reminder: Action Required for ${r.assignment_title}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <h2 style="color: #6366f1;">Hi ${r.student_name},</h2>
                        <p>This is a reminder that you have an upcoming deadline for an assignment.</p>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Assignment:</strong> ${r.assignment_title}</p>
                            <p><strong>Course:</strong> ${r.course_name}</p>
                            <p><strong>Deadline:</strong> ${new Date(r.deadline).toLocaleString()}</p>
                        </div>
                        <p>Please make sure to submit your work before the deadline to avoid late penalties.</p>
                        <p>Best regards,<br><strong>Antigravity Team</strong></p>
                    </div>
                `
            };

            try {
                if (process.env.EMAIL_USER && process.env.EMAIL_PASS !== 'your_app_password') {
                    await transporter.sendMail(mailOptions);
                    console.log(`Reminder sent to ${r.email}`);
                } else {
                    console.log(`Skipping actual email to ${r.email} (Email not configured in .env)`);
                }
            } catch (err) {
                console.error(`Failed to send email to ${r.email}:`, err);
            }
        }
    } catch (error) {
        console.error('Error in reminder cron job:', error);
    }
};

// Run every hour
// cron.schedule('0 * * * *', sendReminders);

// For testing purposes, you can uncomment this to run it every minute
// cron.schedule('* * * * *', sendReminders);

module.exports = { sendReminders };
