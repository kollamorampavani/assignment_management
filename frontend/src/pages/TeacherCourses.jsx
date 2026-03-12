import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSearch } from '../context/SearchContext';
import { Plus, Book, Copy, Check, Users } from 'lucide-react';

const TeacherCourses = () => {
    const { searchQuery } = useSearch();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', description: '' });
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses/teacher-courses');
            setCourses(res.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses/create', newCourse);
            setShowModal(false);
            setNewCourse({ name: '', description: '' });
            fetchCourses();
        } catch (err) {
            alert('Failed to create course');
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredCourses = courses.filter(course => 
        course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="teacher-courses-container">
            <div className="page-header">
                <div>
                    <h1>My Courses</h1>
                    <p className="text-muted">Manage your classes and generate join codes</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Create New Course
                </button>
            </div>

            {loading ? (
                <p>Loading courses...</p>
            ) : (
                <div className="courses-grid">
                    {filteredCourses.length === 0 ? (
                        <div className="empty-state glass-card">
                            <Book size={48} className="text-muted" />
                            <h3>No results found</h3>
                            <p>Try searching for something else or create a new course.</p>
                        </div>
                    ) : (
                        filteredCourses.map((course) => (
                            <div key={course.id} className="glass-card course-card">
                                <div className="course-card-header">
                                    <div className="course-icon">
                                        <Book size={20} />
                                    </div>
                                    <div className="join-code-badge" onClick={() => copyToClipboard(course.join_code)}>
                                        {copiedCode === course.join_code ? (
                                            <><Check size={14} /> Copied</>
                                        ) : (
                                            <><Copy size={14} /> {course.join_code}</>
                                        )}
                                    </div>
                                </div>
                                <h3>{course.name}</h3>
                                <p className="course-desc">{course.description || 'No description provided.'}</p>
                                <div className="course-card-footer">
                                    <div className="stat">
                                        <Users size={16} />
                                        <span>View Students</span>
                                    </div>
                                    <button className="btn btn-outline">Manage</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Course Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content">
                        <h2>Create New Course</h2>
                        <form onSubmit={handleCreateCourse}>
                            <div className="form-group">
                                <label>Course Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Operating Systems"
                                    required
                                    value={newCourse.name}
                                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="input-field"
                                    placeholder="What is this course about?"
                                    rows="4"
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Course</button>
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

        .course-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .course-icon {
          width: 40px;
          height: 40px;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .join-code-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-dark);
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-family: monospace;
          cursor: pointer;
          border: 1px solid var(--border);
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .join-code-badge:hover {
          color: white;
          border-color: var(--primary);
        }

        .course-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
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

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: white;
          padding: 0.5rem 1rem;
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.05);
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
          max-width: 500px;
          animation: modalSlideUp 0.3s ease-out;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
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

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
};

export default TeacherCourses;
