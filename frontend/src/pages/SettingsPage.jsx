import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [health, setHealth] = useState(null);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    api.get('/health/').then((res) => setHealth(res.data)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.patch('/accounts/me/', form);
    await refreshProfile();
    setSaved('Profile updated successfully.');
  };

  return (
    <div className="row g-3">
      <div className="col-lg-6">
        <div className="ff-card p-4">
          <h6 className="fw-bold mb-3">My Profile Settings</h6>
          {saved && <div className="alert alert-success py-2 small">{saved}</div>}
          <form onSubmit={handleSave} className="d-flex flex-column gap-3">
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label small fw-semibold">First Name</label>
                <input className="form-control" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">Last Name</label>
                <input className="form-control" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="form-label small fw-semibold">Phone</label>
              <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="form-label small fw-semibold">Department</label>
              <input className="form-control" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm align-self-start">Save Profile</button>
          </form>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="ff-card p-4">
          <h6 className="fw-bold mb-3">System & Backend Health</h6>
          {health ? (
            <ul className="list-group list-group-flush small">
              <li className="list-group-item d-flex justify-content-between">
                <span>API Status</span>
                <span className="badge text-bg-success">{health.status}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Service</span>
                <strong>{health.service} v{health.version}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Database Engine</span>
                <strong>{health.database}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Database Connected</span>
                <span className={`badge text-bg-${health.database_connected ? 'success' : 'danger'}`}>
                  {health.database_connected ? 'Connected' : 'Disconnected'}
                </span>
              </li>
            </ul>
          ) : (
            <p className="text-muted small">Checking backend health...</p>
          )}
        </div>
      </div>
    </div>
  );
}
