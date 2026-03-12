import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, ClipboardList, Calendar, Target, BookOpen, AlertCircle } from 'lucide-react';

const TeacherAssignments = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        course_id: '',
        title: '',
        description: '',
        deadline: '',
        max_marks: '',
        file: null
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [assignmentsRes, coursesRes] = await Promise.all([
                api.get('/assignments/course/all'), // We'll need to handle "all" or fetch per course, for now let's assume an all route or fetch per course
                api.get('/courses/teacher-courses')
            ]);
            // Note: We might need a specific teacher route for "all assignments", but for now let's fetch courses and then their assignments
            setCourses(coursesRes.data);

            // If no "all" route exists, we can fetch for each course or just show the ones from selected courses
            // In our current backend, we only have getCourseAssignments(course_id).
            // Let's fetch all assignments for all courses the teacher has.
            const allAssignments = [];
            for (const course of coursesRes.data) {
                const res = await api.get(`/assignments/course/${course.id}`);
                const assignmentsWithCourseName = res.data.map(a => ({ ...a, course_name: course.name }));
                allAssignments.push(...assignmentsWithCourseName);
            }
            setAssignments(allAssignments);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('course_id', newAssignment.course_id);
            formData.append('title', newAssignment.title);
            formData.append('description', newAssignment.description);
            formData.append('deadline', newAssignment.deadline);
            formData.append('max_marks', newAssignment.max_marks);
            if (newAssignment.file) {
                formData.append('file', newAssignment.file);
            }

            await api.post('/assignments/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowModal(false);
            setNewAssignment({ course_id: '', title: '', description: '', deadline: '', max_marks: '', file: null });
            fetchInitialData();
        } catch (err) {
            alert('Failed to create assignment');
        }
    };

    return (
        <div className="teacher-assignments-container">
            <div className="page-header">
                <div>
                    <h1>Assignments</h1>
                    <p className="text-muted">Create and manage tasks for your students</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    New Assignment
                </button>
            </div>

            {loading ? (
                <p>Loading assignments...</p>
            ) : (
                <div className="assignments-list">
                    {assignments.length === 0 ? (
                        <div className="empty-state glass-card">
                            <ClipboardList size={48} className="text-muted" />
                            <h3>No assignments created</h3>
                            <p>Start by creating your first assignment in one of your courses.</p>
                        </div>
                    ) : (
                        assignments.map((assignment) => (
                            <div key={assignment.id} className="glass-card assignment-card">
                                <div className="assignment-info">
                                    <div className="course-tag">
                                        <BookOpen size={14} />
                                        {assignment.course_name}
                                    </div>
                                    <h3>{assignment.title}</h3>
                                    <p className="desc">{assignment.description}</p>
                                </div>

                                <div className="assignment-meta">
                                    <div className="meta-item">
                                        <Calendar size={16} />
                                        <span>Due: {new Date(assignment.deadline).toLocaleString()}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Target size={16} />
                                        <span>Max Marks: {assignment.max_marks}</span>
                                    </div>
                                    {assignment.file_url && (
                                        <div className="meta-item">
                                            <AlertCircle size={16} style={{ color: 'var(--primary)' }} />
                                            <a
                                                href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${assignment.file_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--primary)', textDecoration: 'none' }}
                                            >
                                                Reference Document
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="assignment-actions">
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => navigate('/view-submissions', {
                                            state: {
                                                courseId: assignment.course_id,
                                                assignmentId: assignment.id
                                            }
                                        })}
                                    >
                                        View Submissions
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Assignment Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content assignment-modal">
                        <h2>New Assignment</h2>
                        <form onSubmit={handleCreateAssignment}>
                            <div className="form-group">
                                <label>Target Course</label>
                                <select
                                    className="input-field"
                                    required
                                    value={newAssignment.course_id}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, course_id: e.target.value })}
                                >
                                    <option value="">Select a Course</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Assignment Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Project Phase 1"
                                    required
                                    value={newAssignment.title}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Instructions for students..."
                                    rows="3"
                                    value={newAssignment.description}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Deadline</label>
                                    <input
                                        type="datetime-local"
                                        className="input-field"
                                        required
                                        value={newAssignment.deadline}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Max Marks</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        required
                                        placeholder="100"
                                        value={newAssignment.max_marks}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, max_marks: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Reference Document (Optional)</label>
                                <input
                                    type="file"
                                    className="input-field"
                                    onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Assignment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .assignments-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .assignment-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          gap: 2rem;
        }

        .assignment-info {
          flex: 1;
        }

        .course-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
          padding: 0.25rem 0.75rem;
          border-radius: 100px;
          margin-bottom: 0.75rem;
          width: fit-content;
        }

        .assignment-info h3 {
          margin-bottom: 0.5rem;
        }

        .desc {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .assignment-meta {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 220px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .assignment-actions {
          display: flex;
          align-items: center;
        }

        .assignment-modal {
          max-width: 600px;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .flex-1 {
          flex: 1;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(4px);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          text-align: center;
          gap: 1rem;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: white;
          white-space: nowrap;
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 768px) {
          .assignment-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .assignment-meta {
            min-width: auto;
          }
        }
      `}} />
        </div>
    );
};

export default TeacherAssignments;
