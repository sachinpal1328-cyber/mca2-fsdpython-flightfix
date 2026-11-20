import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function SupplyChainPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('CONTRACTS_MANAGER');
  const [vendors, setVendors] = useState([]);
  const [prs, setPrs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('prs');
  const [syncMsg, setSyncMsg] = useState('');

  const loadData = async () => {
    const [vRes, pRes, lRes] = await Promise.all([
      api.get('/supply-chain/vendors/'),
      api.get('/supply-chain/purchase-requests/'),
      api.get('/supply-chain/logs/'),
    ]);
    setVendors(extractResults(vRes.data));
    setPrs(extractResults(pRes.data));
    setLogs(extractResults(lRes.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrAction = async (id, action) => {
    await api.post(`/supply-chain/purchase-requests/${id}/${action}/`);
    loadData();
  };

  const handleSimulateSync = async () => {
    const res = await api.post('/supply-chain/logs/simulate-erp-sync/');
    setSyncMsg(`Simulated ERP Sync Logged: ${res.data.response_message}`);
    loadData();
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="alert alert-warning py-2 small mb-0">
        <i className="bi bi-diagram-3 me-2"></i>
        <strong>Simulated ERP Integration:</strong> External SAP/AMOS ERP endpoints are simulated for demonstration because live enterprise ERP credentials are not connected.
      </div>

      {syncMsg && <div className="alert alert-success py-2 small mb-0">{syncMsg}</div>}

      <div className="ff-card p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="btn-group btn-group-sm">
          <button className={`btn ${tab === 'prs' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('prs')}>
            Purchase Requests ({prs.length})
          </button>
          <button className={`btn ${tab === 'vendors' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('vendors')}>
            Vendors ({vendors.length})
          </button>
          <button className={`btn ${tab === 'logs' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('logs')}>
            ERP Integration Logs ({logs.length})
          </button>
        </div>
        {canManage && (
          <button className="btn btn-outline-dark btn-sm" onClick={handleSimulateSync}>
            <i className="bi bi-arrow-repeat me-1"></i> Trigger Simulated ERP Sync
          </button>
        )}
      </div>

      <div className="ff-card p-3">
        {tab === 'prs' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>PR #</th>
                  <th>Vendor</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Est. Cost (INR)</th>
                  <th>Status</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {prs.map((pr) => (
                  <tr key={pr.id}>
                    <td className="fw-bold text-primary">{pr.pr_number}</td>
                    <td>{pr.vendor_name}</td>
                    <td>{pr.item_description}</td>
                    <td>{pr.quantity}</td>
                    <td>₹{Number(pr.estimated_cost_inr).toLocaleString('en-IN')}</td>
                    <td><StatusBadge value={pr.status} /></td>
                    {canManage && (
                      <td>
                        <div className="btn-group btn-group-sm">
                          {pr.status === 'SUBMITTED' && (
                            <button className="btn btn-outline-primary" onClick={() => handlePrAction(pr.id, 'approve')}>Approve</button>
                          )}
                          {(pr.status === 'APPROVED' || pr.status === 'ORDERED') && (
                            <button className="btn btn-outline-success" onClick={() => handlePrAction(pr.id, 'receive')}>Receive to Stock</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'vendors' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Vendor Name</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td className="fw-bold">{v.vendor_code}</td>
                    <td>{v.name}</td>
                    <td className="small">{v.contact_person} ({v.phone})</td>
                    <td className="small">{v.city}, {v.country}</td>
                    <td>{'★'.repeat(v.rating)}</td>
                    <td><StatusBadge value={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'logs' && (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>System</th>
                  <th>Direction</th>
                  <th>Action</th>
                  <th>Payload</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="fw-semibold">{l.system_name}</td>
                    <td><span className="badge text-bg-secondary">{l.direction}</span></td>
                    <td>{l.action}</td>
                    <td className="small text-muted">{l.payload_summary}</td>
                    <td><StatusBadge value={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
