import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Book, Search, User } from 'lucide-react';

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses/student-courses');
            setCourses(res.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCourse = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/courses/join', { join_code: joinCode });
            setShowModal(false);
            setJoinCode('');
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join course');
        }
    };

    return (
        <div className="student-courses-container">
            <div className="page-header">
                <div>
                    <h1>My Enrolled Courses</h1>
                    <p className="text-muted">Access your classes and assignments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Join New Course
                </button>
            </div>

            {loading ? (
                <p>Loading courses...</p>
            ) : (
                <div className="courses-grid">
                    {courses.length === 0 ? (
                        <div className="empty-state glass-card">
                            <Book size={48} className="text-muted" />
                            <h3>Not enrolled in any courses</h3>
                            <p>Ask your teacher for a join code to get started.</p>
                        </div>
                    ) : (
                        courses.map((course) => (
                            <div key={course.id} className="glass-card course-card">
                                <div className="course-card-header">
                                    <div className="course-icon">
                                        <Book size={20} />
                                    </div>
                                </div>
                                <h3>{course.name}</h3>
                                <p className="course-desc">{course.description || 'No description provided.'}</p>
                                <div className="course-card-footer">
                                    <div className="stat">
                                        <User size={16} />
                                        <span>{course.teacher_name || 'Teacher'}</span>
                                    </div>
                                    <button className="btn btn-outline">Enter Class</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Join Course Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content">
                        <h2>Join a Course</h2>
                        <p className="subtitle">Enter the 6-character code provided by your teacher</p>

                        {error && <div className="error-alert">{error}</div>}

                        <form onSubmit={handleJoinCourse}>
                            <div className="form-group">
                                <label>Join Code</label>
                                <input
                                    type="text"
                                    className="input-field code-input"
                                    placeholder="e.g. AB1234"
                                    required
                                    maxLength="6"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Join Course</button>
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
          margin-bottom: 2.5rem;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .course-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.2s;
        }

        .course-card:hover {
          transform: translateY(-4px);
        }

        .course-icon {
          width: 40px;
          height: 40px;
          background: rgba(236, 72, 153, 0.1);
          color: var(--secondary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .course-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          height: 40px;
          overflow: hidden;
        }

        .course-card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .code-input {
          text-align: center;
          font-size: 1.5rem;
          letter-spacing: 0.5rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          border: 1px solid var(--danger);
          font-size: 0.875rem;
        }

        .subtitle {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
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

        .modal-content {
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          text-align: center;
          gap: 1rem;
        }
      `}} />
        </div>
    );
};

export default StudentCourses;
