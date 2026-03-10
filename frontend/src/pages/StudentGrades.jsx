import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Award,
    BookOpen,
    CheckCircle,
    MessageSquare,
    Clock,
    ClipboardList
} from 'lucide-react';

const StudentGrades = () => {
    const [courses, setCourses] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const coursesRes = await api.get('/courses/student-courses');
            const allGrades = [];

            for (const course of coursesRes.data) {
                const res = await api.get(`/assignments/my-submissions/${course.id}`);
                const dataWithCourse = res.data.map(item => ({
                    ...item,
                    course_name: course.name,
                    id: item.assignment_id // for key in map
                }));
                allGrades.push(...dataWithCourse);
            }
            // Filter to only show assignments that HAVE been submitted
            setGrades(allGrades.filter(g => g.submission_id !== null));
        } catch (err) {
            console.error('Error fetching grades:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-grades-container">
            <div className="page-header">
                <div>
                    <h1>My Grades & Feedback</h1>
                    <p className="text-muted">Track your performance across all courses</p>
                </div>
            </div>

            {loading ? (
                <p>Loading your results...</p>
            ) : (
                <div className="grades-list">
                    {grades.length === 0 ? (
                        <div className="empty-state glass-card">
                            <Award size={48} className="text-muted" />
                            <h3>No grades to show yet</h3>
                            <p>Once your assignments are graded, they will appear here.</p>
                        </div>
                    ) : (
                        grades.map((item) => (
                            <div key={item.id} className="glass-card grade-card">
                                <div className="grade-header">
                                    <div className="course-info">
                                        <div className="course-tag">
                                            <BookOpen size={14} />
                                            {item.course_name}
                                        </div>
                                        <h3>{item.title}</h3>
                                    </div>
                                    <div className="score-summary">
                                        <div className="score-label">Score</div>
                                        <div className="score-value">
                                            {item.marks !== null ? item.marks : 'Pending'}
                                        </div>
                                    </div>
                                </div>

                                {item.marks !== null ? (
                                    <div className="result-notice graded">
                                        <div className="notice-icon"><CheckCircle size={16} /></div>
                                        <div className="feedback-content">
                                            <p className="feedback-label">Teacher Feedback:</p>
                                            <p className="feedback-text">{item.feedback || 'No feedback provided.'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="result-notice">
                                        <div className="notice-icon"><Clock size={16} /></div>
                                        <p>Your submission is currently under review by the teacher.</p>
                                    </div>
                                )}
                                <div className="submission-meta">
                                    <Clock size={12} />
                                    <span>Submitted on: {new Date(item.submitted_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .grade-card {
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .grade-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .course-info h3 {
                    margin-top: 0.5rem;
                    font-size: 1.1rem;
                }

                .course-tag {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--secondary);
                    background: rgba(236, 72, 153, 0.1);
                    padding: 0.25rem 0.75rem;
                    border-radius: 100px;
                    width: fit-content;
                }

                .score-summary {
                    text-align: right;
                }

                .score-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.25rem;
                }

                .score-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary);
                }

                .result-notice {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 0.75rem;
                    border: 1px solid var(--border);
                }

                .notice-icon {
                    width: 32px;
                    height: 32px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                }

                .result-notice p {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .result-notice.graded {
                    background: rgba(16, 185, 129, 0.05);
                    border-color: rgba(16, 185, 129, 0.2);
                }

                .result-notice.graded .notice-icon {
                    color: var(--success);
                    background: rgba(16, 185, 129, 0.1);
                }

                .feedback-label {
                    font-weight: 600;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    margin-bottom: 0.25rem;
                    color: var(--success);
                }

                .feedback-text {
                    color: white !important;
                    font-style: italic;
                }

                .submission-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: -0.5rem;
                }
            `}} />
        </div>
    );
};

export default StudentGrades;
