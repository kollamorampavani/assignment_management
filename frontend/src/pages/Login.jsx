import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const role = res.data.user.role;
      if (role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to manage your assignments</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
        }
        .login-card h2 {
          font-size: 3.5rem; /* Increased from 2rem */
          margin-bottom: 1rem;
          text-align: center;
        }
        .subtitle {
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 3rem;
          font-size: 1.5rem; /* Increased */
        }
        .form-group label {
          display: block;
          margin-bottom: 0.75rem;
          font-size: 1.25rem; /* Increased from 0.875rem */
          color: var(--text-muted);
          font-weight: 600;
        }
        .btn {
          width: 100%;
          margin-top: 1rem;
        }
        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
          border: 1px solid var(--danger);
          font-size: 1.15rem; /* Increased from 0.875rem */
        }
        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 1.25rem; /* Increased from 0.875rem */
          color: var(--text-muted);
        }
      `}} />
    </div>
  );
};

export default Login;
