import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    ClipboardList,
    BookOpen,
    Award,
    Clock,
    ChevronRight,
    LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const [summary, setSummary] = useState({
        enrolledCourses: 0,
        upcomingTasks: 0,
        completedTasks: 0,
        averageGrade: 'N/A'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await api.get('/analytics/student-stats');
            setSummary(res.data);
        } catch (err) {
            console.error('Error fetching student stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const user = JSON.parse(localStorage.getItem('user')) || {};

    const stats = [
        { label: 'Enrolled Courses', value: summary.enrolledCourses, icon: <BookOpen size={20} />, color: '#6366f1' },
        { label: 'Upcoming Tasks', value: summary.upcomingTasks, icon: <Clock size={20} />, color: '#f59e0b' },
        { label: 'Completed', value: summary.completedTasks, icon: <ClipboardList size={20} />, color: '#10b981' },
        { label: 'Avg Grade', value: summary.averageGrade, icon: <Award size={20} />, color: '#ec4899' },
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Hi, {user.name || 'Student'} 👋</h1>
                <p className="text-muted">Stay on top of your assignments and track your progress.</p>
            </header>

            <div className=" student-stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card stat-item">
                        <div className="stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="glass-card main-section">
                    <div className="section-header">
                        <h2>Continue Learning</h2>
                        <Link to="/my-courses" className="view-all">View All <ChevronRight size={16} /></Link>
                    </div>
                    <div className="empty-state">
                        <BookOpen size={40} className="text-muted" />
                        <p>You haven't enrolled in any courses yet.</p>
                        <Link to="/my-courses" className="btn btn-primary small">Explore Courses</Link>
                    </div>
                </div>

                <div className="glass-card side-section">
                    <div className="section-header">
                        <h2>Deadlines</h2>
                    </div>
                    <div className="deadline-list">
                        <div className="empty-state mini">
                            <Clock size={24} />
                            <p>No upcoming deadlines.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .dashboard-header {
                    margin-bottom: 2rem;
                }

                .student-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.25rem;
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                }

                .stat-label {
                    font-size: 1.25rem; /* Increased from 1rem */
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.25rem;
                    font-weight: 700;
                }

                .stat-value {
                    font-size: 2.5rem; /* Increased from 1.85rem */
                    font-weight: 900;
                    color: white;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 1.5rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .section-header h2 {
                    font-size: 2rem; /* Increased from 1.5rem */
                    font-weight: 900;
                }

                .view-all {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.875rem;
                    color: var(--primary);
                    text-decoration: none;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    padding: 3rem 0;
                    color: var(--text-muted);
                    text-align: center;
                }

                .empty-state.mini {
                    padding: 1.5rem 0;
                    font-size: 0.875rem;
                }

                .btn.small {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                }

                @media (max-width: 900px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}} />
        </div>
    );
};

export default StudentDashboard;
