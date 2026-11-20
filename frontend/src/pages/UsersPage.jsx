import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'FIELD_TECHNICIAN',
    employee_id: '',
    department: 'MRO Operations',
  });

  const loadUsers = async () => {
    const res = await api.get('/accounts/users/', { params: { search } });
    setUsers(extractResults(res.data));
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/accounts/users/', form);
      setShowModal(false);
      loadUsers();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Failed to create user.'));
    }
  };

  const toggleActive = async (u) => {
    await api.post(`/accounts/users/${u.id}/${u.is_active ? 'deactivate' : 'activate'}/`);
    loadUsers();
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="ff-card p-3 d-flex justify-content-between align-items-center gap-2">
        <input
          className="form-control form-control-sm"
          style={{ width: 240 }}
          placeholder="Search users, email, employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-person-plus me-1"></i> Add User
        </button>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="ff-card p-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="small fw-semibold">{u.employee_id || '-'}</td>
                  <td>{u.full_name}<div className="small text-muted">{u.email}</div></td>
                  <td className="small">{u.username}</td>
                  <td><span className="badge text-bg-primary">{u.role.replace(/_/g, ' ')}</span></td>
                  <td className="small">{u.department}</td>
                  <td>
                    <span className={`badge text-bg-${u.is_active ? 'success' : 'secondary'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm btn-outline-${u.is_active ? 'danger' : 'success'}`}
                      onClick={() => toggleActive(u)}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleCreate}>
              <div className="modal-header">
                <h5 className="modal-title">Create New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body row g-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold">First Name</label>
                  <input className="form-control" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Last Name</label>
                  <input className="form-control" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Username</label>
                  <input className="form-control" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Email</label>
                  <input type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Password</label>
                  <input type="password" minLength="8" className="form-control" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Role</label>
                  <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="ADMIN">Admin</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="CONTRACTS_MANAGER">Contracts Manager</option>
                    <option value="FIELD_TECHNICIAN">Field Technician</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Employee ID</label>
                  <input className="form-control" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Department</label>
                  <input className="form-control" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
