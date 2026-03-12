import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSearch } from '../context/SearchContext';
import {
ClipboardList, Calendar, Target, BookOpen, Download, Upload, CheckCircle, Clock, Book } from 'lucide-react';

const StudentAssignments = () => {
    const { searchQuery } = useSearch();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const coursesRes = await api.get('/courses/student-courses');
            const allAssignments = [];

            for (const course of coursesRes.data) {
                // Fetch assignments AND their submission status for this student
                const [assignmentsRes, submissionsRes] = await Promise.all([
                    api.get(`/assignments/course/${course.id}`),
                    api.get(`/assignments/my-submissions/${course.id}`)
                ]);

                // Merge assignment data with submission data
                const merged = assignmentsRes.data.map(assignment => {
                    const submission = submissionsRes.data.find(s => s.assignment_id === assignment.id);
                    // Ensure we check for actual submission_id being present
                    const isSubmitted = submission && submission.submission_id !== null;

                    return {
                        ...assignment,
                        course_name: course.name,
                        submission_status: isSubmitted ? submission.status : 'not_submitted',
                        submission_id: isSubmitted ? submission.submission_id : null
                    };
                });

                allAssignments.push(...merged);
            }

            setAssignments(allAssignments);
        } catch (err) {
            console.error('Error fetching assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, assignmentId) => {
        e.preventDefault();
        if (!selectedFile) return alert('Please select a file first');

        try {
            const formData = new FormData();
            formData.append('assignment_id', assignmentId);
            formData.append('file', selectedFile);

            await api.post('/assignments/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Assignment submitted successfully!');
            setSubmittingId(null);
            setSelectedFile(null);
            fetchAssignments(); // Refresh to show updated status (if backend supports it)
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit assignment');
        }
    };

    const filteredAssignments = assignments.filter(assignment =>
        assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="student-assignments-container">
            <header className="page-header">
                <div>
                    <h1>Assignments</h1>
                    <p className="text-muted">Stay track of your upcoming and completed tasks</p>
                </div>
            </header>

            {loading ? (
                <p>Loading assignments...</p>
            ) : (
                <div className="assignments-grid">
                    {filteredAssignments.length === 0 ? (
                        <div className="empty-state glass-card">
                            <Book size={48} className="text-muted" />
                            <h3>No results found</h3>
                            <p>Try searching for something else.</p>
                        </div>
                    ) : (
                        filteredAssignments.map((assignment) => (
                            <div key={assignment.id} className="glass-card assignment-card shadow-hover">
                                <div className="assignment-main">
                                    <div className="assignment-header">
                                        <div className="course-tag">
                                            <BookOpen size={14} />
                                            {assignment.course_name}
                                        </div>
                                        {new Date(assignment.deadline) < new Date() ? (
                                            <div className="status-badge late">
                                                <Clock size={14} />
                                                Past Deadline
                                            </div>
                                        ) : (
                                            <div className="status-badge active">
                                                <Calendar size={14} />
                                                Upcoming
                                            </div>
                                        )}
                                    </div>

                                    <h3>{assignment.title}</h3>
                                    <p className="desc">{assignment.description}</p>

                                    <div className="meta-row">
                                        <div className="meta-item">
                                            <Calendar size={16} />
                                            <span>Deadline: {new Date(assignment.deadline).toLocaleString()}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Target size={16} />
                                            <span>Marks: {assignment.max_marks}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="assignment-side">
                                    {assignment.file_url && (
                                        <a
                                            href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${assignment.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="download-btn"
                                        >
                                            <Download size={18} />
                                            Reference Doc
                                        </a>
                                    )}

                                    {assignment.submission_status !== 'not_submitted' ? (
                                        <div className="submission-confirmed glass-card">
                                            <CheckCircle size={20} className="text-success" />
                                            <div>
                                                <p className="status-text">Work Submitted</p>
                                                <p className="status-sub">{assignment.submission_status === 'late' ? 'Submitted Late' : 'Submitted on time'}</p>
                                            </div>
                                        </div>
                                    ) : submittingId === assignment.id ? (
                                        <form onSubmit={(e) => handleFileUpload(e, assignment.id)} className="submit-form">
                                            <input
                                                type="file"
                                                className="file-input"
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                                required
                                            />
                                            <div className="form-buttons">
                                                <button type="submit" className="btn btn-primary small">Upload</button>
                                                <button type="button" className="btn btn-secondary small" onClick={() => setSubmittingId(null)}>Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setSubmittingId(assignment.id)}
                                            disabled={new Date(assignment.deadline) < new Date()}
                                        >
                                            <Upload size={18} style={{ marginRight: '8px' }} />
                                            {new Date(assignment.deadline) < new Date() ? 'Missed Deadline' : 'Submit Work'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .student-assignments-container {
                    padding-bottom: 2rem;
                }

                .assignments-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .assignment-card {
                    display: flex;
                    justify-content: space-between;
                    padding: 1.75rem;
                    gap: 2rem;
                    border: 1px solid var(--border);
                }

                .assignment-main {
                    flex: 1;
                }

                .assignment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
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
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.75rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 100px;
                    font-weight: 500;
                }

                .status-badge.active {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--success);
                }

                .status-badge.late {
                    background: rgba(245, 158, 11, 0.1);
                    color: #f59e0b;
                }

                .desc {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin: 1rem 0;
                    line-height: 1.5;
                }

                .meta-row {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .assignment-side {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    min-width: 220px;
                    justify-content: center;
                }

                .download-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.6rem;
                    padding: 0.75rem;
                    background: var(--bg-dark);
                    border: 1px solid var(--border);
                    border-radius: 0.75rem;
                    color: white;
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }

                .download-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .submit-form {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .file-input {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    padding: 0.5rem;
                    background: var(--bg-dark);
                    border: 1px dashed var(--border);
                    border-radius: 0.5rem;
                }

                .form-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn.small {
                    padding: 0.4rem 0.75rem;
                    font-size: 0.75rem;
                }

                .submission-confirmed {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .status-text {
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: white;
                }

                .status-sub {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .text-success {
                    color: var(--success);
                }

                @media (max-width: 768px) {
                    .assignment-card {
                        flex-direction: column;
                    }
                    .assignment-side {
                        min-width: auto;
                    }
                }
            `}} />
        </div>
    );
};

export default StudentAssignments;
