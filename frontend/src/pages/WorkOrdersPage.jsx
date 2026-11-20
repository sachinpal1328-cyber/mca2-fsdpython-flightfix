import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function WorkOrdersPage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole('SAFETY_OFFICER');
  const [orders, setOrders] = useState([]);
  const [aircraftList, setAircraftList] = useState([]);
  const [techList, setTechList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedWO, setSelectedWO] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    aircraft: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    assigned_technician: '',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [woRes, acRes, tRes] = await Promise.all([
        api.get('/workorders/orders/', {
          params: { search, status: statusFilter || undefined, priority: priorityFilter || undefined },
        }),
        api.get('/aircraft/'),
        api.get('/accounts/technicians/'),
      ]);
      const list = extractResults(woRes.data);
      setOrders(list);
      setAircraftList(extractResults(acRes.data));
      setTechList(extractResults(tRes.data));
      if (selectedWO) {
        const updated = list.find((w) => w.id === selectedWO.id);
        if (updated) setSelectedWO(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, priorityFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/workorders/orders/', {
      ...form,
      assigned_technician: form.assigned_technician || null,
    });
    setShowModal(false);
    loadData();
  };

  const handleAction = async (id, action) => {
    await api.post(`/workorders/orders/${id}/${action}/`);
    loadData();
  };

  const handleToggleTask = async (taskId) => {
    await api.post(`/workorders/tasks/${taskId}/toggle/`);
    loadData();
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedWO) return;
    await api.post('/workorders/tasks/', {
      work_order: selectedWO.id,
      title: newTaskTitle.trim(),
      order: (selectedWO.tasks?.length || 0) + 1,
    });
    setNewTaskTitle('');
    loadData();
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="ff-card p-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <div className="d-flex flex-wrap gap-2">
          <input
            className="form-control form-control-sm"
            style={{ width: 220 }}
            placeholder="Search WO # or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="form-select form-select-sm" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select className="form-select form-select-sm" style={{ width: 140 }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        {canCreate && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setForm({
                ...form,
                aircraft: aircraftList[0]?.id || '',
                title: '',
                description: '',
              });
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-lg me-1"></i> Create Work Order
          </button>
        )}
      </div>

      <div className="ff-card p-3">
        {loading ? (
          <div className="text-center py-4 text-muted">Loading work orders...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>WO #</th>
                  <th>Title</th>
                  <th>Aircraft</th>
                  <th>Priority</th>
                  <th>Technician</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((wo) => (
                  <tr key={wo.id}>
                    <td className="fw-bold text-primary">{wo.wo_number}</td>
                    <td>{wo.title}</td>
                    <td><span className="badge text-bg-dark">{wo.aircraft_registration}</span></td>
                    <td><StatusBadge value={wo.priority} /></td>
                    <td className="small">{wo.assigned_technician_name || 'Unassigned'}</td>
                    <td className="small">{wo.due_date}</td>
                    <td><StatusBadge value={wo.status} /></td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => setSelectedWO(wo)}>
                          Tasks ({wo.task_count})
                        </button>
                        {wo.status === 'OPEN' && (
                          <button className="btn btn-outline-primary" onClick={() => handleAction(wo.id, 'start')}>
                            Start
                          </button>
                        )}
                        {wo.status !== 'COMPLETED' && (
                          <button className="btn btn-outline-success" onClick={() => handleAction(wo.id, 'complete')}>
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedWO && (
        <div className="ff-card p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">
              {selectedWO.wo_number} — Task Checklist ({selectedWO.aircraft_registration})
            </h6>
            <button className="btn btn-sm btn-close" onClick={() => setSelectedWO(null)}></button>
          </div>
          <p className="small text-muted mb-3">{selectedWO.description}</p>
          <ul className="list-group mb-3">
            {(selectedWO.tasks || []).map((t) => (
              <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={t.is_completed}
                    onChange={() => handleToggleTask(t.id)}
                    id={`task-${t.id}`}
                  />
                  <label
                    className={`form-check-label ${t.is_completed ? 'text-decoration-line-through text-muted' : ''}`}
                    htmlFor={`task-${t.id}`}
                  >
                    {t.title}
                  </label>
                </div>
                {t.completed_by_name && <small className="text-muted">by {t.completed_by_name}</small>}
              </li>
            ))}
          </ul>
          <form className="d-flex gap-2" onSubmit={handleAddTask}>
            <input
              className="form-control form-control-sm"
              placeholder="Add new checklist task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <button className="btn btn-sm btn-primary" type="submit">Add Task</button>
          </form>
        </div>
      )}

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleCreate}>
              <div className="modal-header">
                <h5 className="modal-title">Create Work Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-semibold">Title</label>
                  <input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Aircraft</label>
                    <select className="form-select" required value={form.aircraft} onChange={(e) => setForm({ ...form, aircraft: e.target.value })}>
                      <option value="">Select</option>
                      {aircraftList.map((a) => <option key={a.id} value={a.id}>{a.registration}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Priority</label>
                    <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Technician</label>
                    <select className="form-select" value={form.assigned_technician} onChange={(e) => setForm({ ...form, assigned_technician: e.target.value })}>
                      <option value="">Unassigned</option>
                      {techList.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Due Date</label>
                    <input type="date" className="form-control" required value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea className="form-control" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
