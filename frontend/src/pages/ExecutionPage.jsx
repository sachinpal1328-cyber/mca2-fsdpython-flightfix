import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function ExecutionPage() {
  const [logs, setLogs] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [form, setForm] = useState({ work_order: '', hours_logged: '2.0', notes: '' });
  const [partUsageForm, setPartUsageForm] = useState({ execution: '', part: '', quantity_used: 1 });
  const [showPartModal, setShowPartModal] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    const [lRes, wRes, pRes] = await Promise.all([
      api.get('/execution/logs/'),
      api.get('/workorders/orders/'),
      api.get('/inventory/parts/'),
    ]);
    setLogs(extractResults(lRes.data));
    setWorkOrders(extractResults(wRes.data));
    setParts(extractResults(pRes.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartLog = async (e) => {
    e.preventDefault();
    await api.post('/execution/logs/', form);
    setShowLogModal(false);
    loadData();
  };

  const handleComplete = async (id) => {
    await api.post(`/execution/logs/${id}/complete/`);
    loadData();
  };

  const handleLogPart = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/execution/parts-used/', partUsageForm);
      setShowPartModal(false);
      loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Failed to log part usage.'));
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="ff-card p-3 d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0">Maintenance Execution Logs & Documentation</h6>
          <small className="text-muted">Track technician work hours, checklists, and spare parts consumed</small>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setForm({ work_order: workOrders[0]?.id || '', hours_logged: '2.0', notes: '' });
            setShowLogModal(true);
          }}
        >
          <i className="bi bi-play-circle me-1"></i> Start Execution Log
        </button>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="row g-3">
        {logs.map((log) => (
          <div className="col-lg-6" key={log.id}>
            <div className="ff-card p-3 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="fw-bold text-primary">{log.wo_number}</span>{' '}
                    <span className="badge text-bg-dark">{log.aircraft_registration}</span>
                    <div className="fw-semibold mt-1">{log.work_order_title}</div>
                  </div>
                  <StatusBadge value={log.status} />
                </div>
                <div className="small text-muted mb-2">
                  Technician: <strong>{log.technician_name}</strong> · Hours: <strong>{log.hours_logged}h</strong>
                </div>
                <p className="small bg-light p-2 rounded mb-2">{log.notes || 'No notes recorded.'}</p>
                {log.parts_used?.length > 0 && (
                  <div className="small mb-2">
                    <strong>Parts Consumed:</strong>{' '}
                    {log.parts_used.map((pu) => (
                      <span key={pu.id} className="badge text-bg-secondary me-1">
                        {pu.quantity_used}x {pu.part_number}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="d-flex gap-2 mt-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    setPartUsageForm({ execution: log.id, part: parts[0]?.id || '', quantity_used: 1 });
                    setShowPartModal(true);
                  }}
                >
                  + Log Part Used
                </button>
                {log.status !== 'COMPLETED' && (
                  <button className="btn btn-success btn-sm" onClick={() => handleComplete(log.id)}>
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showLogModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleStartLog}>
              <div className="modal-header">
                <h5 className="modal-title">New Maintenance Execution Log</h5>
                <button type="button" className="btn-close" onClick={() => setShowLogModal(false)}></button>
              </div>
              <div className="modal-body d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-semibold">Work Order</label>
                  <select className="form-select" required value={form.work_order} onChange={(e) => setForm({ ...form, work_order: e.target.value })}>
                    {workOrders.map((w) => <option key={w.id} value={w.id}>{w.wo_number} — {w.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label small fw-semibold">Hours Logged</label>
                  <input type="number" step="0.5" min="0" className="form-control" value={form.hours_logged} onChange={(e) => setForm({ ...form, hours_logged: e.target.value })} />
                </div>
                <div>
                  <label className="form-label small fw-semibold">Maintenance Notes</label>
                  <textarea className="form-control" rows="3" required value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPartModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleLogPart}>
              <div className="modal-header">
                <h5 className="modal-title">Log Spare Part Consumed</h5>
                <button type="button" className="btn-close" onClick={() => setShowPartModal(false)}></button>
              </div>
              <div className="modal-body d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-semibold">Spare Part</label>
                  <select className="form-select" required value={partUsageForm.part} onChange={(e) => setPartUsageForm({ ...partUsageForm, part: e.target.value })}>
                    {parts.map((p) => <option key={p.id} value={p.id}>{p.part_number} — {p.name} (Avail: {p.quantity})</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label small fw-semibold">Quantity Used</label>
                  <input type="number" min="1" className="form-control" required value={partUsageForm.quantity_used} onChange={(e) => setPartUsageForm({ ...partUsageForm, quantity_used: Number(e.target.value) })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPartModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Deduct & Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
