import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function TechnicianMobilePage() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [noteInput, setNoteInput] = useState({});
  const [partSelect, setPartSelect] = useState({});
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    const [woRes, pRes] = await Promise.all([
      api.get('/workorders/orders/my_work_orders/'),
      api.get('/inventory/parts/'),
    ]);
    setWorkOrders(extractResults(woRes.data));
    setParts(extractResults(pRes.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleTask = async (taskId) => {
    await api.post(`/workorders/tasks/${taskId}/toggle/`);
    loadData();
  };

  const updateWoStatus = async (woId, action) => {
    await api.post(`/workorders/orders/${woId}/${action}/`);
    setFeedback(`Work order updated (${action}).`);
    loadData();
  };

  const logFieldNote = async (wo) => {
    const notes = noteInput[wo.id];
    if (!notes?.trim()) return;
    const execRes = await api.post('/execution/logs/', {
      work_order: wo.id,
      hours_logged: '1.5',
      notes: notes.trim(),
    });
    const selectedPartId = partSelect[wo.id];
    if (selectedPartId) {
      await api.post('/execution/parts-used/', {
        execution: execRes.data.id,
        part: selectedPartId,
        quantity_used: 1,
      });
    }
    setNoteInput({ ...noteInput, [wo.id]: '' });
    setFeedback(`Logged field notes${selectedPartId ? ' & part usage' : ''} for ${wo.wo_number}.`);
    loadData();
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 680 }}>
      <div className="ff-card p-3 mb-3 bg-dark text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-info fw-semibold">FIELD TECHNICIAN MOBILE WORKSPACE</small>
            <h5 className="mb-0 fw-bold">{user?.full_name || user?.username}</h5>
            <small className="text-secondary">{user?.department}</small>
          </div>
          <span className="badge text-bg-success fs-6">{workOrders.length} WOs</span>
        </div>
      </div>

      {feedback && (
        <div className="alert alert-success py-2 small alert-dismissible">
          {feedback}
          <button type="button" className="btn-close" onClick={() => setFeedback('')}></button>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {workOrders.map((wo) => (
          <div key={wo.id} className="ff-card p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span className="fw-bold text-primary">{wo.wo_number}</span>{' '}
                <span className="badge text-bg-dark">{wo.aircraft_registration}</span>
                <h6 className="fw-bold mt-1 mb-0">{wo.title}</h6>
              </div>
              <div className="d-flex flex-column align-items-end gap-1">
                <StatusBadge value={wo.status} />
                <StatusBadge value={wo.priority} />
              </div>
            </div>

            <div className="small text-muted mb-2">Due: {wo.due_date}</div>

            <div className="mb-3">
              <div className="small fw-semibold mb-1">Checklist Tasks</div>
              {(wo.tasks || []).map((t) => (
                <div key={t.id} className="form-check py-1 border-bottom">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={t.is_completed}
                    onChange={() => toggleTask(t.id)}
                    id={`mob-task-${t.id}`}
                  />
                  <label
                    className={`form-check-label small ${t.is_completed ? 'text-decoration-line-through text-muted' : ''}`}
                    htmlFor={`mob-task-${t.id}`}
                  >
                    {t.title}
                  </label>
                </div>
              ))}
            </div>

            <div className="d-flex flex-column gap-2 mb-3">
              <input
                className="form-control form-control-sm"
                placeholder="Add field maintenance note..."
                value={noteInput[wo.id] || ''}
                onChange={(e) => setNoteInput({ ...noteInput, [wo.id]: e.target.value })}
              />
              <div className="d-flex gap-2">
                <select
                  className="form-select form-select-sm"
                  value={partSelect[wo.id] || ''}
                  onChange={(e) => setPartSelect({ ...partSelect, [wo.id]: e.target.value })}
                >
                  <option value="">Optional: Part Used (1 unit)</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>{p.part_number} — {p.name} ({p.quantity})</option>
                  ))}
                </select>
                <button className="btn btn-outline-primary btn-sm text-nowrap" onClick={() => logFieldNote(wo)}>
                  Log Work
                </button>
              </div>
            </div>

            <div className="d-grid gap-2 d-sm-flex">
              {wo.status === 'OPEN' && (
                <button className="btn btn-primary btn-sm flex-fill" onClick={() => updateWoStatus(wo.id, 'start')}>
                  Start Job
                </button>
              )}
              {wo.status !== 'COMPLETED' && (
                <button className="btn btn-success btn-sm flex-fill" onClick={() => updateWoStatus(wo.id, 'complete')}>
                  Complete Work Order
                </button>
              )}
            </div>
          </div>
        ))}
        {workOrders.length === 0 && (
          <div className="ff-card p-4 text-center text-muted">No work orders assigned to you.</div>
        )}
      </div>
    </div>
  );
}
