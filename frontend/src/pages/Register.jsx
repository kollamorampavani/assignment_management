import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/register', formData);
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card login-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join our platform to manage assignments</p>

        {error && <div className="error-alert">{error}</div>}
        {successMsg && <div className="success-alert">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              className="input-field"
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="Min 6 characters"
              required
              minLength="6"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <div className="role-selector">
              <label className={`role-option ${formData.role === 'student' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                />
                Student
              </label>
              <label className={`role-option ${formData.role === 'teacher' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={formData.role === 'teacher'}
                  onChange={handleChange}
                />
                Teacher
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }
        .login-card {
          width: 100%;
          max-width: 450px;
        }
        .login-card h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .subtitle {
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .role-selector {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .role-option {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background: #0f172a;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .role-option input {
          display: none;
        }
        .role-option.active {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
        }
        .btn {
          width: 100%;
          margin-top: 1rem;
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
        .success-alert {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          border: 1px solid var(--success);
          font-size: 0.875rem;
          text-align: center;
        }
        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
      `}} />
    </div>
  );
};

export default Register;
