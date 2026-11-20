import React, { useEffect, useState } from 'react';
import api, { extractResults } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [aircraftList, setAircraftList] = useState([]);
  const [filters, setFilters] = useState({ aircraft: '', priority: '', status: '' });

  const loadAnalytics = async () => {
    const [anRes, acRes] = await Promise.all([
      api.get('/analytics/dashboard/', {
        params: {
          aircraft: filters.aircraft || undefined,
          priority: filters.priority || undefined,
          status: filters.status || undefined,
        },
      }),
      api.get('/aircraft/'),
    ]);
    setData(anRes.data);
    setAircraftList(extractResults(acRes.data));
  };

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};

  return (
    <div className="d-flex flex-column gap-3">
      <div className="ff-card p-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <h6 className="fw-bold mb-0">Operational Analytics & Report Filters</h6>
        <div className="d-flex flex-wrap gap-2">
          <select className="form-select form-select-sm" style={{ width: 160 }} value={filters.aircraft} onChange={(e) => setFilters({ ...filters, aircraft: e.target.value })}>
            <option value="">All Aircraft</option>
            {aircraftList.map((a) => <option key={a.id} value={a.id}>{a.registration}</option>)}
          </select>
          <select className="form-select form-select-sm" style={{ width: 140 }} value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select className="form-select form-select-sm" style={{ width: 150 }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All WO Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-3">
          <div className="ff-card p-3">
            <div className="small text-muted">Total Work Orders (Filtered)</div>
            <div className="fs-3 fw-bold">{kpis.total_work_orders ?? 0}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ff-card p-3">
            <div className="small text-muted">Total Hours Logged</div>
            <div className="fs-3 fw-bold">{kpis.total_hours_logged ?? 0} hrs</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ff-card p-3">
            <div className="small text-muted">Open Purchase Requests</div>
            <div className="fs-3 fw-bold">{kpis.open_purchase_requests ?? 0}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ff-card p-3">
            <div className="small text-muted">Fleet Equipment Count</div>
            <div className="fs-3 fw-bold">{kpis.total_equipment ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="ff-card p-3 h-100">
            <h6 className="fw-bold mb-3">Work Orders by Priority</h6>
            {(charts.work_orders_by_priority || []).map((row) => (
              <div key={row.priority} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <StatusBadge value={row.priority} />
                <span className="fw-bold">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="ff-card p-3 h-100">
            <h6 className="fw-bold mb-3">Technician Workload</h6>
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Technician</th>
                  <th>Assigned Work Orders</th>
                </tr>
              </thead>
              <tbody>
                {(charts.technician_workload || []).map((t) => (
                  <tr key={t.assigned_technician__id}>
                    <td>
                      {t.assigned_technician__first_name} {t.assigned_technician__last_name} ({t.assigned_technician__username})
                    </td>
                    <td className="fw-bold">{t.total_assigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
