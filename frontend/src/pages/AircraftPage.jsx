import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function AircraftPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('SAFETY_OFFICER');
  const [tab, setTab] = useState('aircraft');
  const [aircraft, setAircraft] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState('');
  const [showAcModal, setShowAcModal] = useState(false);
  const [acForm, setAcForm] = useState({
    registration: '',
    model_name: '',
    manufacturer: '',
    serial_number: '',
    aircraft_type: 'COMMERCIAL',
    status: 'OPERATIONAL',
    flight_hours: 0,
    base_location: 'IGI Airport, New Delhi (VIDP)',
  });

  const loadData = async () => {
    const [aRes, eRes] = await Promise.all([
      api.get('/aircraft/', { params: { search } }),
      api.get('/equipment/', { params: { search } }),
    ]);
    setAircraft(extractResults(aRes.data));
    setEquipment(extractResults(eRes.data));
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleSaveAircraft = async (e) => {
    e.preventDefault();
    await api.post('/aircraft/', acForm);
    setShowAcModal(false);
    loadData();
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="ff-card p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="btn-group btn-group-sm">
          <button className={`btn ${tab === 'aircraft' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('aircraft')}>
            Aircraft Fleet ({aircraft.length})
          </button>
          <button className={`btn ${tab === 'equipment' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('equipment')}>
            Equipment Registry ({equipment.length})
          </button>
        </div>
        <div className="d-flex gap-2">
          <input
            className="form-control form-control-sm"
            style={{ width: 220 }}
            placeholder="Search registration, model, S/N..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {canEdit && tab === 'aircraft' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAcModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Add Aircraft
            </button>
          )}
        </div>
      </div>

      <div className="ff-card p-3">
        {tab === 'aircraft' ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Registration</th>
                  <th>Model</th>
                  <th>Manufacturer</th>
                  <th>Serial #</th>
                  <th>Flight Hours</th>
                  <th>Base Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {aircraft.map((a) => (
                  <tr key={a.id}>
                    <td className="fw-bold">{a.registration}</td>
                    <td>{a.model_name}</td>
                    <td>{a.manufacturer}</td>
                    <td className="small text-muted">{a.serial_number}</td>
                    <td>{a.flight_hours} hrs</td>
                    <td className="small">{a.base_location}</td>
                    <td><StatusBadge value={a.status} /></td>
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
                  <th>Equipment Name</th>
                  <th>Aircraft</th>
                  <th>Part #</th>
                  <th>Serial #</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((eq) => (
                  <tr key={eq.id}>
                    <td className="fw-semibold">{eq.name}</td>
                    <td><span className="badge text-bg-dark">{eq.aircraft_registration}</span></td>
                    <td className="small">{eq.part_number}</td>
                    <td className="small text-muted">{eq.serial_number}</td>
                    <td className="small">{eq.category}</td>
                    <td><StatusBadge value={eq.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAcModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleSaveAircraft}>
              <div className="modal-header">
                <h5 className="modal-title">Register Aircraft</h5>
                <button type="button" className="btn-close" onClick={() => setShowAcModal(false)}></button>
              </div>
              <div className="modal-body row g-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Registration</label>
                  <input className="form-control" placeholder="VT-XXX" required value={acForm.registration} onChange={(e) => setAcForm({ ...acForm, registration: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Serial Number</label>
                  <input className="form-control" required value={acForm.serial_number} onChange={(e) => setAcForm({ ...acForm, serial_number: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Manufacturer</label>
                  <input className="form-control" required value={acForm.manufacturer} onChange={(e) => setAcForm({ ...acForm, manufacturer: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Model Name</label>
                  <input className="form-control" required value={acForm.model_name} onChange={(e) => setAcForm({ ...acForm, model_name: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select" value={acForm.status} onChange={(e) => setAcForm({ ...acForm, status: e.target.value })}>
                    <option value="OPERATIONAL">Operational</option>
                    <option value="IN_MAINTENANCE">In Maintenance</option>
                    <option value="GROUNDED">Grounded</option>
                    <option value="AOG">AOG</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Flight Hours</label>
                  <input type="number" step="0.1" className="form-control" value={acForm.flight_hours} onChange={(e) => setAcForm({ ...acForm, flight_hours: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Base Location</label>
                  <input className="form-control" value={acForm.base_location} onChange={(e) => setAcForm({ ...acForm, base_location: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAcModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Aircraft</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
