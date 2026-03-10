import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import {
    ClipboardList,
    User,
    FileText,
    CheckCircle,
    Clock,
    ExternalLink,
    MessageSquare,
    Award
} from 'lucide-react';

const ViewSubmissions = () => {
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gradingData, setGradingData] = useState({ submission_id: '', marks: '', feedback: '' });
    const [showGradingModal, setShowGradingModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            await fetchCourses();
            if (location.state?.courseId) {
                await handleCourseChange(location.state.courseId);
                if (location.state?.assignmentId) {
                    fetchSubmissions(location.state.assignmentId);
                }
            }
        };
        init();
    }, [location.state]);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses/teacher-courses');
            setCourses(res.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const handleCourseChange = async (courseId) => {
        setSelectedCourse(courseId);
        setSelectedAssignment('');
        setSubmissions([]);
        if (!courseId) return;

        try {
            const res = await api.get(`/assignments/course/${courseId}`);
            setAssignments(res.data);
        } catch (err) {
            console.error('Error fetching assignments:', err);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        setSelectedAssignment(assignmentId);
        if (!assignmentId) return;

        setLoading(true);
        try {
            const res = await api.get(`/assignments/submissions/${assignmentId}`);
            setSubmissions(res.data);
        } catch (err) {
            console.error('Error fetching submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assignments/grade', gradingData);
            setShowGradingModal(false);
            fetchSubmissions(selectedAssignment);
            setGradingData({ submission_id: '', marks: '', feedback: '' });
        } catch (err) {
            alert('Failed to submit grade');
        }
    };

    return (
        <div className="submissions-container">
            <div className="page-header">
                <div>
                    <h1>Submissions & Grading</h1>
                    <p className="text-muted">Review and grade your students' work</p>
                </div>
            </div>

            <div className="filters glass-card">
                <div className="filter-group">
                    <label>Select Course</label>
                    <select
                        className="input-field"
                        value={selectedCourse}
                        onChange={(e) => handleCourseChange(e.target.value)}
                    >
                        <option value="">Choose a course...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Select Assignment</label>
                    <select
                        className="input-field"
                        disabled={!selectedCourse}
                        value={selectedAssignment}
                        onChange={(e) => fetchSubmissions(e.target.value)}
                    >
                        <option value="">Choose an assignment...</option>
                        {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Loading submissions...</p>
            ) : (
                <div className="submissions-grid">
                    {!selectedAssignment ? (
                        <div className="empty-state glass-card">
                            <ClipboardList size={48} className="text-muted" />
                            <h3>Select an assignment to view submissions</h3>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="empty-state glass-card">
                            <User size={48} className="text-muted" />
                            <h3>No submissions yet</h3>
                            <p>Students haven't uploaded any work for this task.</p>
                        </div>
                    ) : (
                        <div className="submissions-table-container glass-card">
                            <table className="submissions-table">
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Status</th>
                                        <th>Submitted At</th>
                                        <th>File</th>
                                        <th>Grade</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((sub) => (
                                        <tr key={sub.id}>
                                            <td>
                                                <div className="student-cell">
                                                    <div className="avatar-sm"><User size={14} /></div>
                                                    {sub.student_name}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${sub.status}`}>
                                                    {sub.status === 'late' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td>{new Date(sub.submitted_at).toLocaleString()}</td>
                                            <td>
                                                <a
                                                    href={`http://localhost:5000${sub.file_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="file-link"
                                                >
                                                    <FileText size={16} />
                                                    View Work
                                                </a>
                                            </td>
                                            <td>
                                                {sub.marks !== null ? (
                                                    <div className="grade-badge">
                                                        <Award size={14} />
                                                        {sub.marks} marks
                                                    </div>
                                                ) : (
                                                    <span className="pending">Not Graded</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-primary small"
                                                    onClick={() => {
                                                        setGradingData({ submission_id: sub.id, marks: sub.marks || '', feedback: sub.feedback || '' });
                                                        setShowGradingModal(true);
                                                    }}
                                                >
                                                    {sub.marks !== null ? 'Edit Grade' : 'Grade Now'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Grading Modal */}
            {showGradingModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content">
                        <h2>Grade Submission</h2>
                        <form onSubmit={handleGradeSubmit}>
                            <div className="form-group">
                                <label>Marks</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="e.g. 85"
                                    required
                                    value={gradingData.marks}
                                    onChange={(e) => setGradingData({ ...gradingData, marks: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Feedback</label>
                                <textarea
                                    className="input-field"
                                    rows="4"
                                    placeholder="Well done..."
                                    value={gradingData.feedback}
                                    onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowGradingModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Grade</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .filters {
          display: flex;
          gap: 2rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid var(--border);
        }

        .filter-group {
          flex: 1;
        }

        .filter-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .submissions-table-container {
          overflow-x: auto;
          border: 1px solid var(--border);
        }

        .submissions-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .submissions-table th, .submissions-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.875rem;
        }

        .submissions-table th {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .student-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        .avatar-sm {
          width: 28px;
          height: 28px;
          background: var(--bg-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          border: 1px solid var(--border);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.6rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .badge.submitted { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .badge.late { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

        .file-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          text-decoration: none;
        }

        .grade-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: white;
          background: rgba(99, 102, 241, 0.2);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-weight: 600;
        }

        .pending { color: var(--text-muted); font-style: italic; }

        .empty-state {
          padding: 4rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .btn.small {
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
        }
      `}} />
        </div>
    );
};

export default ViewSubmissions;
