import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Users,
    BookOpen,
    ClipboardCheck,
    AlertCircle,
    TrendingUp,
    Clock
} from 'lucide-react';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalAssignments: 0,
        totalStudents: 0,
        pendingGrading: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/analytics/dashboard-stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'Total Courses', value: stats.totalCourses, icon: <BookOpen size={24} />, color: '#6366f1' },
        { title: 'Active Assignments', value: stats.totalAssignments, icon: <ClipboardCheck size={24} />, color: '#10b981' },
        { title: 'Total Students', value: stats.totalStudents, icon: <Users size={24} />, color: '#ec4899' },
        { title: 'Pending Grading', value: stats.pendingGrading, icon: <AlertCircle size={24} />, color: '#f59e0b' },
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome Back, Teacher</h1>
                <p className="text-muted">Here's what's happening in your courses today.</p>
            </header>

            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <div key={index} className="glass-card stat-card">
                        <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{card.value}</h3>
                            <p>{card.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-sections">
                <section className="dashboard-section glass-card">
                    <div className="section-header">
                        <div className="section-title">
                            <TrendingUp size={20} />
                            <h2>Recent Activity</h2>
                        </div>
                    </div>
                    <div className="activity-list">
                        <div className="empty-activity">
                            <Clock size={32} />
                            <p>All caught up! No recent submissions to show.</p>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section glass-card">
                    <div className="section-header">
                        <div className="section-title">
                            <BookOpen size={20} />
                            <h2>Quick Actions</h2>
                        </div>
                    </div>
                    <div className="quick-actions">
                        <button className="action-btn" onClick={() => navigate('/teacher-courses')}>Create Course</button>
                        <button className="action-btn" onClick={() => navigate('/teacher-assignments')}>Post Assignment</button>
                        <button className="action-btn" onClick={() => navigate('/view-submissions')}>View Submissions</button>
                    </div>
                </section>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .dashboard-header {
                    margin-bottom: 2.5rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    transition: transform 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-info h3 {
                    font-size: 3.5rem; /* Increased from 2.75rem */
                    font-weight: 900;
                    margin-bottom: 0.25rem;
                }

                .stat-info p {
                    font-size: 1.4rem; /* Increased from 1.15rem */
                    color: var(--text-muted);
                    font-weight: 700;
                }

                .dashboard-sections {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }

                .dashboard-section {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                }

                .section-header {
                    margin-bottom: 1.5rem;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: white;
                }

                .empty-activity {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: var(--text-muted);
                    padding: 3rem 0;
                    text-align: center;
                }

                .quick-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .action-btn {
                    padding: 1.5rem; /* Increased padding */
                    background: var(--bg-dark);
                    border: 1px solid var(--border);
                    color: white;
                    border-radius: 0.75rem;
                    text-align: left;
                    font-size: 1.4rem; /* Increased from 1.15rem */
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 700;
                }

                .action-btn:hover {
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.05);
                }

                @media (max-width: 992px) {
                    .dashboard-sections {
                        grid-template-columns: 1fr;
                    }
                }
            `}} />
        </div>
    );
};

export default TeacherDashboard;
