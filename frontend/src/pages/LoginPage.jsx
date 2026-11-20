import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Admin', username: 'admin', role: 'Full System Access' },
  { label: 'Safety Officer', username: 'safety_officer', role: 'Fleet, Plans, Compliance' },
  { label: 'Contracts Mgr', username: 'contracts_mgr', role: 'Inventory & Supply Chain' },
  { label: 'Field Tech', username: 'tech_arjun', role: 'Mobile Execution & WOs' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(username, password);
      if (userData.role === 'FIELD_TECHNICIAN') {
        navigate('/technician-mobile');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (uname) => {
    setUsername(uname);
    setPassword('FlightFix@123');
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'linear-gradient(135deg, #0b192c 0%, #152943 60%, #1e3a5f 100%)' }}
    >
      <div className="ff-card p-4 p-md-5 shadow-lg" style={{ maxWidth: 460, width: '100%' }}>
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
            style={{ width: 56, height: 56, background: '#0b192c', color: '#10b981' }}
          >
            <i className="bi bi-airplane-engines-fill fs-2"></i>
          </div>
          <h3 className="fw-bold mb-1">FlightFix MRO</h3>
          <p className="text-muted small mb-0">
            Enhancing Aircraft Maintenance Efficiency — Aerospace & Defense
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold py-2"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In to FlightFix'}
          </button>
        </form>

        <hr className="my-4" />
        <div className="small text-muted mb-2 fw-semibold">
          Demo Role Accounts (Password: <code>FlightFix@123</code>)
        </div>
        <div className="row g-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <div className="col-6" key={acc.username}>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100 text-start"
                onClick={() => quickFill(acc.username)}
              >
                <div className="fw-semibold">{acc.label}</div>
                <div style={{ fontSize: '0.7rem' }} className="text-muted text-truncate">
                  {acc.role}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
