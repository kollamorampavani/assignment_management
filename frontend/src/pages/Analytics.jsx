import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    BarChart3,
    Users,
    CheckCircle,
    AlertCircle,
    Target,
    ChevronDown
} from 'lucide-react';

const Analytics = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses/teacher-courses');
            setCourses(res.data);
        } catch (err) {
            console.error('Error fetching courses');
        }
    };

    const handleCourseChange = async (courseId) => {
        setSelectedCourse(courseId);
        setStats(null);
        setSelectedAssignment('');
        if (!courseId) return;

        try {
            const res = await api.get(`/assignments/course/${courseId}`);
            setAssignments(res.data);
        } catch (err) {
            console.error('Error fetching assignments');
        }
    };

    const fetchAnalytics = async (assignmentId) => {
        setSelectedAssignment(assignmentId);
        if (!assignmentId) return;

        setLoading(true);
        try {
            const res = await api.get(`/analytics/assignment/${assignmentId}`);
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="analytics-container">
            <div className="page-header">
                <div>
                    <h1>Detailed Analytics</h1>
                    <p className="text-muted">Analyze student performance and submission rates.</p>
                </div>
            </div>

            <div className="selection-bar glass-card">
                <div className="select-group">
                    <label>Course</label>
                    <div className="select-wrapper">
                        <select value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)}>
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="select-icon" size={16} />
                    </div>
                </div>

                <div className="select-group">
                    <label>Assignment</label>
                    <div className="select-wrapper">
                        <select
                            disabled={!selectedCourse}
                            value={selectedAssignment}
                            onChange={(e) => fetchAnalytics(e.target.value)}
                        >
                            <option value="">Select Assignment</option>
                            {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                        </select>
                        <ChevronDown className="select-icon" size={16} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Calculating data...</p>
                </div>
            ) : stats ? (
                <div className="analytics-content">
                    <div className="analytics-stats-grid">
                        <div className="glass-card analytics-stat">
                            <Users color="#6366f1" />
                            <div className="stat-data">
                                <span className="label">Total Students</span>
                                <span className="value">{stats.totalStudents}</span>
                            </div>
                        </div>
                        <div className="glass-card analytics-stat">
                            <CheckCircle color="#10b981" />
                            <div className="stat-data">
                                <span className="label">Submissions</span>
                                <span className="value">{stats.totalSubmissions}</span>
                            </div>
                        </div>
                        <div className="glass-card analytics-stat">
                            <AlertCircle color="#f59e0b" />
                            <div className="stat-data">
                                <span className="label">Pending Work</span>
                                <span className="value">{stats.pendingSubmissions}</span>
                            </div>
                        </div>
                        <div className="glass-card analytics-stat">
                            <Target color="#ec4899" />
                            <div className="stat-data">
                                <span className="label">Average Grade</span>
                                <span className="value">{stats.averageMarks} / {stats.maxMarks}</span>
                            </div>
                        </div>
                    </div>

                    <div className="progress-section glass-card">
                        <h3>Submission Rate</h3>
                        <div className="progress-bar-container">
                            <div
                                className="progress-fill"
                                style={{ width: `${(stats.totalSubmissions / (stats.totalStudents || 1)) * 100}%` }}
                            ></div>
                        </div>
                        <div className="progress-labels">
                            <span>{Math.round((stats.totalSubmissions / (stats.totalStudents || 1)) * 100)}% Participation</span>
                            <span>{stats.totalSubmissions} of {stats.totalStudents} Students</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="analytics-placeholder glass-card">
                    <BarChart3 size={64} className="text-muted" />
                    <h2>Ready to Analyze</h2>
                    <p>Select a course and an assignment above to view performance metrics.</p>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .selection-bar {
                    display: flex;
                    gap: 2rem;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    border: 1px solid var(--border);
                }

                .select-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .select-group label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .select-wrapper {
                    position: relative;
                }

                .select-wrapper select {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: var(--bg-dark);
                    border: 1px solid var(--border);
                    color: white;
                    border-radius: 0.75rem;
                    appearance: none;
                    cursor: pointer;
                    outline: none;
                }

                .select-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    color: var(--text-muted);
                }

                .analytics-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .analytics-stat {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.5rem;
                }

                .stat-data {
                    display: flex;
                    flex-direction: column;
                }

                .stat-data .label {
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                }

                .stat-data .value {
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .progress-section {
                    padding: 2rem;
                    border: 1px solid var(--border);
                }

                .progress-bar-container {
                    height: 12px;
                    background: var(--bg-dark);
                    border-radius: 6px;
                    margin: 1.5rem 0 1rem;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                    border-radius: 6px;
                    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .progress-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }

                .analytics-placeholder {
                    padding: 5rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 5rem;
                    gap: 1rem;
                    color: var(--text-muted);
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
};

export default Analytics;
