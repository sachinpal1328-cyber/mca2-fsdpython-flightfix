import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function MaintenancePage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('SAFETY_OFFICER');
  const [plans, setPlans] = useState([]);
  const [aircraftList, setAircraftList] = useState([]);
  const [techList, setTechList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    aircraft: '',
    maintenance_type: 'A_CHECK',
    frequency_days: 90,
    frequency_hours: 500,
    scheduled_date: '',
    due_date: '',
    status: 'SCHEDULED',
    assigned_to: '',
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, aRes, tRes] = await Promise.all([
        api.get('/maintenance/plans/', { params: { search, status: statusFilter || undefined } }),
        api.get('/aircraft/'),
        api.get('/accounts/technicians/'),
      ]);
      setPlans(extractResults(pRes.data));
      setAircraftList(extractResults(aRes.data));
      setTechList(extractResults(tRes.data));
    } catch (err) {
      setError('Failed to load maintenance plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      aircraft: aircraftList[0]?.id || '',
      maintenance_type: 'A_CHECK',
      frequency_days: 90,
      frequency_hours: 500,
      scheduled_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      status: 'SCHEDULED',
      assigned_to: '',
      description: '',
    });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title,
      aircraft: p.aircraft,
      maintenance_type: p.maintenance_type,
      frequency_days: p.frequency_days,
      frequency_hours: p.frequency_hours,
      scheduled_date: p.scheduled_date,
      due_date: p.due_date,
      status: p.status,
      assigned_to: p.assigned_to || '',
      description: p.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, assigned_to: form.assigned_to || null };
      if (editing) {
        await api.patch(`/maintenance/plans/${editing.id}/`, payload);
      } else {
        await api.post('/maintenance/plans/', payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Failed to save maintenance plan.'));
    }
  };

  const handleArchive = async (id) => {
    await api.post(`/maintenance/plans/${id}/archive/`);
    loadData();
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="ff-card p-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <div className="d-flex flex-wrap gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: 220 }}
            placeholder="Search plans or aircraft..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select form-select-sm"
            style={{ width: 170 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        {canEdit && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <i className="bi bi-plus-lg me-1"></i> New Maintenance Plan
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="ff-card p-3">
        {loading ? (
          <div className="text-center py-4 text-muted">Loading schedules...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Aircraft</th>
                  <th>Type</th>
                  <th>Scheduled</th>
                  <th>Due Date</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.title}</td>
                    <td><span className="badge text-bg-dark">{p.aircraft_registration}</span></td>
                    <td className="small">{p.maintenance_type.replace(/_/g, ' ')}</td>
                    <td className="small">{p.scheduled_date}</td>
                    <td className="small fw-semibold">{p.due_date}</td>
                    <td className="small">{p.assigned_to_name || 'Unassigned'}</td>
                    <td><StatusBadge value={p.status} /></td>
                    {canEdit && (
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => openEdit(p)}>Edit</button>
                          {p.status !== 'ARCHIVED' && (
                            <button className="btn btn-outline-secondary" onClick={() => handleArchive(p.id)}>Archive</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr><td colSpan="8" className="text-center text-muted py-4">No maintenance plans found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <form className="modal-content" onSubmit={handleSave}>
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Edit Maintenance Plan' : 'New Maintenance Plan'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body row g-3">
                <div className="col-md-8">
                  <label className="form-label small fw-semibold">Plan Title</label>
                  <input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Aircraft</label>
                  <select className="form-select" required value={form.aircraft} onChange={(e) => setForm({ ...form, aircraft: e.target.value })}>
                    <option value="">Select Aircraft</option>
                    {aircraftList.map((a) => (
                      <option key={a.id} value={a.id}>{a.registration} ({a.model_name})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Type</label>
                  <select className="form-select" value={form.maintenance_type} onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}>
                    <option value="A_CHECK">A-Check</option>
                    <option value="B_CHECK">B-Check</option>
                    <option value="C_CHECK">C-Check</option>
                    <option value="D_CHECK">D-Check</option>
                    <option value="LINE">Line Maintenance</option>
                    <option value="UNSCHEDULED">Unscheduled / AOG</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Scheduled Date</label>
                  <input type="date" className="form-control" required value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Due Date</label>
                  <input type="date" className="form-control" required value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Assigned Technician</label>
                  <select className="form-select" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                    <option value="">Unassigned</option>
                    {techList.map((t) => (
                      <option key={t.id} value={t.id}>{t.full_name} ({t.role})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Frequency (Days)</label>
                  <input type="number" className="form-control" min="1" value={form.frequency_days} onChange={(e) => setForm({ ...form, frequency_days: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea className="form-control" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
