import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function CompliancePage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('SAFETY_OFFICER');
  const [records, setRecords] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [aircraftList, setAircraftList] = useState([]);
  const [tab, setTab] = useState('records');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    regulation_code: '',
    category: 'DGCA_CAR',
    aircraft: '',
    status: 'COMPLIANT',
    issue_date: new Date().toISOString().slice(0, 10),
    expiry_date: '',
    notes: '',
  });

  const loadData = async () => {
    const [rRes, iRes, aRes] = await Promise.all([
      api.get('/compliance/records/'),
      api.get('/compliance/inspections/'),
      api.get('/aircraft/'),
    ]);
    setRecords(extractResults(rRes.data));
    setInspections(extractResults(iRes.data));
    setAircraftList(extractResults(aRes.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.post('/compliance/records/', {
      ...form,
      aircraft: form.aircraft || null,
      expiry_date: form.expiry_date || null,
    });
    setShowModal(false);
    loadData();
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="alert alert-info py-2 small mb-0">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Educational Demonstration Notice:</strong> Compliance records and DGCA/FAA/EASA references shown here are for academic MRO workflow demonstration only and do not represent official regulatory certification.
      </div>

      <div className="ff-card p-3 d-flex justify-content-between align-items-center">
        <div className="btn-group btn-group-sm">
          <button className={`btn ${tab === 'records' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('records')}>
            Compliance Records ({records.length})
          </button>
          <button className={`btn ${tab === 'inspections' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('inspections')}>
            Inspections ({inspections.length})
          </button>
        </div>
        {canEdit && tab === 'records' && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> Add Compliance Record
          </button>
        )}
      </div>

      <div className="ff-card p-3">
        {tab === 'records' ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Aircraft</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-bold">{r.regulation_code}</td>
                    <td>{r.title}</td>
                    <td className="small">{r.category.replace(/_/g, ' ')}</td>
                    <td><span className="badge text-bg-dark">{r.aircraft_registration}</span></td>
                    <td className="small">{r.expiry_date || 'N/A'}</td>
                    <td><StatusBadge value={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Aircraft</th>
                  <th>Compliance Item</th>
                  <th>Inspector</th>
                  <th>Findings</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((ins) => (
                  <tr key={ins.id}>
                    <td className="small">{ins.inspection_date}</td>
                    <td><span className="badge text-bg-dark">{ins.aircraft_registration}</span></td>
                    <td>{ins.compliance_title}</td>
                    <td className="small">{ins.inspector_name}</td>
                    <td className="small text-muted">{ins.findings}</td>
                    <td><StatusBadge value={ins.result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleSave}>
              <div className="modal-header">
                <h5 className="modal-title">Add Compliance Record</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body row g-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Regulation Code</label>
                  <input className="form-control" required value={form.regulation_code} onChange={(e) => setForm({ ...form, regulation_code: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Category</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="DGCA_CAR">DGCA CAR</option>
                    <option value="FAA_AD">Airworthiness Directive</option>
                    <option value="EASA_SB">Service Bulletin</option>
                    <option value="INTERNAL_SAFETY">Internal Safety Audit</option>
                    <option value="ENVIRONMENTAL">Environmental</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Title</label>
                  <input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Aircraft (Optional)</label>
                  <select className="form-select" value={form.aircraft} onChange={(e) => setForm({ ...form, aircraft: e.target.value })}>
                    <option value="">Fleet-Wide</option>
                    {aircraftList.map((a) => <option key={a.id} value={a.id}>{a.registration}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="COMPLIANT">Compliant</option>
                    <option value="PENDING">Pending</option>
                    <option value="EXPIRING_SOON">Expiring Soon</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Issue Date</label>
                  <input type="date" className="form-control" required value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Expiry Date</label>
                  <input type="date" className="form-control" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
