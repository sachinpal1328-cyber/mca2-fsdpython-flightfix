import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function InventoryPage() {
  const { hasRole } = useAuth();
  const canManageParts = hasRole('CONTRACTS_MANAGER');
  const [parts, setParts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [error, setError] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveForm, setMoveForm] = useState({ part: '', movement_type: 'IN', quantity: 1, reference_note: '' });
  const [showPartModal, setShowPartModal] = useState(false);
  const [partForm, setPartForm] = useState({
    part_number: '',
    name: '',
    category: 'AIRFRAME',
    quantity: 10,
    min_stock_threshold: 5,
    warehouse_location: 'Delhi Hangar Store A1',
    supplier_name: '',
    unit_cost_inr: 15000,
  });

  const loadData = async () => {
    const [pRes, mRes] = await Promise.all([
      api.get(lowStockOnly ? '/inventory/parts/low_stock/' : '/inventory/parts/', { params: { search } }),
      api.get('/inventory/movements/'),
    ]);
    setParts(extractResults(pRes.data));
    setMovements(extractResults(mRes.data));
  };

  useEffect(() => {
    loadData();
  }, [search, lowStockOnly]);

  const handleMovement = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/inventory/movements/', moveForm);
      setShowMoveModal(false);
      loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Stock movement failed.'));
    }
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/inventory/parts/', partForm);
      setShowPartModal(false);
      loadData();
    } catch (err) {
      setError(JSON.stringify(err.response?.data || 'Failed to add part.'));
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="ff-card p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <input
            className="form-control form-control-sm"
            style={{ width: 220 }}
            placeholder="Search part #, name, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="form-check form-switch mb-0 ms-2">
            <input className="form-check-input" type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} id="lowStockSwitch" />
            <label className="form-check-label small fw-semibold" htmlFor="lowStockSwitch">Low Stock Only</label>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => {
              setMoveForm({ part: parts[0]?.id || '', movement_type: 'IN', quantity: 1, reference_note: '' });
              setShowMoveModal(true);
            }}
          >
            <i className="bi bi-arrow-left-right me-1"></i> Record Stock Movement
          </button>
          {canManageParts && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowPartModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Add Spare Part
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="ff-card p-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Part Number</th>
                <th>Name</th>
                <th>Category</th>
                <th>Qty (Min)</th>
                <th>Unit Cost (INR)</th>
                <th>Location</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id}>
                  <td className="fw-bold">{p.part_number}</td>
                  <td>{p.name}</td>
                  <td className="small">{p.category}</td>
                  <td className="fw-semibold">{p.quantity} <span className="text-muted small">({p.min_stock_threshold})</span></td>
                  <td>₹{Number(p.unit_cost_inr).toLocaleString('en-IN')}</td>
                  <td className="small">{p.warehouse_location}</td>
                  <td>
                    {p.is_low_stock ? (
                      <span className="badge text-bg-danger">LOW STOCK</span>
                    ) : (
                      <span className="badge text-bg-success">IN STOCK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ff-card p-3">
        <h6 className="fw-bold mb-3">Recent Stock Movements</h6>
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Part #</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Note</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 8).map((m) => (
                <tr key={m.id}>
                  <td className="fw-semibold">{m.part_number}</td>
                  <td><StatusBadge value={m.movement_type === 'IN' ? 'ACTIVE' : 'HIGH'} /> {m.movement_type}</td>
                  <td>{m.quantity}</td>
                  <td className="small text-muted">{m.reference_note}</td>
                  <td className="small">{m.performed_by_name || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showMoveModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleMovement}>
              <div className="modal-header">
                <h5 className="modal-title">Record Stock Movement</h5>
                <button type="button" className="btn-close" onClick={() => setShowMoveModal(false)}></button>
              </div>
              <div className="modal-body d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-semibold">Spare Part</label>
                  <select className="form-select" required value={moveForm.part} onChange={(e) => setMoveForm({ ...moveForm, part: e.target.value })}>
                    {parts.map((p) => <option key={p.id} value={p.id}>{p.part_number} — {p.name} (Qty: {p.quantity})</option>)}
                  </select>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Type</label>
                    <select className="form-select" value={moveForm.movement_type} onChange={(e) => setMoveForm({ ...moveForm, movement_type: e.target.value })}>
                      <option value="IN">Stock IN (Restock)</option>
                      <option value="OUT">Stock OUT (Issue)</option>
                      <option value="ADJUSTMENT">Adjustment (Set Qty)</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Quantity</label>
                    <input type="number" min="1" className="form-control" required value={moveForm.quantity} onChange={(e) => setMoveForm({ ...moveForm, quantity: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-semibold">Reference Note</label>
                  <input className="form-control" required value={moveForm.reference_note} onChange={(e) => setMoveForm({ ...moveForm, reference_note: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMoveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPartModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleAddPart}>
              <div className="modal-header">
                <h5 className="modal-title">Add Spare Part</h5>
                <button type="button" className="btn-close" onClick={() => setShowPartModal(false)}></button>
              </div>
              <div className="modal-body row g-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Part Number</label>
                  <input className="form-control" required value={partForm.part_number} onChange={(e) => setPartForm({ ...partForm, part_number: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Category</label>
                  <select className="form-select" value={partForm.category} onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}>
                    <option value="AIRFRAME">Airframe</option>
                    <option value="AVIONICS">Avionics</option>
                    <option value="ENGINE">Engine</option>
                    <option value="HYDRAULICS">Hydraulics</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="CONSUMABLES">Consumables</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Part Name</label>
                  <input className="form-control" required value={partForm.name} onChange={(e) => setPartForm({ ...partForm, name: e.target.value })} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-semibold">Qty</label>
                  <input type="number" min="0" className="form-control" value={partForm.quantity} onChange={(e) => setPartForm({ ...partForm, quantity: Number(e.target.value) })} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-semibold">Min Stock</label>
                  <input type="number" min="1" className="form-control" value={partForm.min_stock_threshold} onChange={(e) => setPartForm({ ...partForm, min_stock_threshold: Number(e.target.value) })} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-semibold">Cost (INR)</label>
                  <input type="number" min="0" className="form-control" value={partForm.unit_cost_inr} onChange={(e) => setPartForm({ ...partForm, unit_cost_inr: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Warehouse Location</label>
                  <input className="form-control" value={partForm.warehouse_location} onChange={(e) => setPartForm({ ...partForm, warehouse_location: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPartModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Part</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
