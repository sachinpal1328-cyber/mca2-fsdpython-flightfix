import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/analytics/dashboard/')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load dashboard metrics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Loading FlightFix operational telemetry...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const highlights = data?.highlights || {};

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-3">
        <div className="col-6 col-xl-3">
          <div className="ff-card ff-kpi-card p-3 h-100">
            <div className="text-muted small fw-semibold">Total Aircraft Fleet</div>
            <div className="fs-2 fw-bold mt-1">{kpis.total_aircraft ?? 0}</div>
            <div className="small text-success">
              {kpis.operational_aircraft ?? 0} Operational · {kpis.in_maintenance_aircraft ?? 0} In MRO
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="ff-card ff-kpi-card green p-3 h-100">
            <div className="text-muted small fw-semibold">Active Work Orders</div>
            <div className="fs-2 fw-bold mt-1">{kpis.active_work_orders ?? 0}</div>
            <div className="small text-muted">
              {kpis.completed_work_orders ?? 0} Completed of {kpis.total_work_orders ?? 0} total
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="ff-card ff-kpi-card amber p-3 h-100">
            <div className="text-muted small fw-semibold">Maintenance Schedule</div>
            <div className="fs-2 fw-bold mt-1">{kpis.pending_maintenance ?? 0}</div>
            <div className="small text-danger fw-semibold">
              {kpis.overdue_maintenance ?? 0} Overdue Plans
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="ff-card ff-kpi-card red p-3 h-100">
            <div className="text-muted small fw-semibold">Low Stock Parts</div>
            <div className="fs-2 fw-bold mt-1">{kpis.low_stock_parts ?? 0}</div>
            <div className="small text-muted">
              Inventory Value: ₹{Number(kpis.total_inventory_value_inr || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="ff-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Work Orders by Status</h6>
              <Link to="/workorders" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            {(charts.work_orders_by_status || []).map((row) => {
              const pct = kpis.total_work_orders
                ? Math.round((row.count / kpis.total_work_orders) * 100)
                : 0;
              return (
                <div key={row.status} className="mb-2">
                  <div className="d-flex justify-content-between small mb-1">
                    <StatusBadge value={row.status} />
                    <span className="fw-semibold">{row.count} ({pct}%)</span>
                  </div>
                  <div className="progress" style={{ height: 7 }}>
                    <div className="progress-bar bg-primary" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="ff-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Compliance Overview</h6>
              <Link to="/compliance" className="btn btn-sm btn-outline-primary">
                Audit Records
              </Link>
            </div>
            {(charts.compliance_by_status || []).map((row) => (
              <div key={row.status} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <StatusBadge value={row.status} />
                <span className="fw-bold">{row.count} records</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="ff-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Upcoming Maintenance Plans</h6>
              <Link to="/maintenance" className="btn btn-sm btn-outline-secondary">
                Schedule
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Aircraft</th>
                    <th>Plan</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(highlights.upcoming_maintenance || []).map((m) => (
                    <tr key={m.id}>
                      <td className="fw-semibold">{m.aircraft__registration}</td>
                      <td>{m.title}</td>
                      <td>{m.due_date}</td>
                      <td><StatusBadge value={m.status} /></td>
                    </tr>
                  ))}
                  {(!highlights.upcoming_maintenance || highlights.upcoming_maintenance.length === 0) && (
                    <tr><td colSpan="4" className="text-muted text-center py-3">No upcoming plans.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="ff-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Low Stock Spare Parts Alerts</h6>
              <Link to="/inventory" className="btn btn-sm btn-outline-danger">
                Restock
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Part #</th>
                    <th>Name</th>
                    <th>Qty / Min</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {(highlights.low_stock_items || []).map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.part_number}</td>
                      <td>{p.name}</td>
                      <td>
                        <span className="badge text-bg-danger">
                          {p.quantity} / {p.min_stock_threshold}
                        </span>
                      </td>
                      <td className="small text-muted">{p.warehouse_location}</td>
                    </tr>
                  ))}
                  {(!highlights.low_stock_items || highlights.low_stock_items.length === 0) && (
                    <tr><td colSpan="4" className="text-muted text-center py-3">All parts above minimum threshold.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
