import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api, { extractResults } from '../api/client';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'bi-speedometer2', roles: ['ADMIN', 'SAFETY_OFFICER', 'CONTRACTS_MANAGER', 'FIELD_TECHNICIAN'] },
  { to: '/maintenance', label: 'Maintenance Planning', icon: 'bi-calendar2-check', roles: ['ADMIN', 'SAFETY_OFFICER', 'CONTRACTS_MANAGER', 'FIELD_TECHNICIAN'] },
  { to: '/workorders', label: 'Work Orders', icon: 'bi-clipboard2-pulse', roles: ['ADMIN', 'SAFETY_OFFICER', 'CONTRACTS_MANAGER', 'FIELD_TECHNICIAN'] },
  { to: '/aircraft', label: 'Aircraft & Equipment', icon: 'bi-airplane', roles: ['ADMIN', 'SAFETY_OFFICER', 'CONTRACTS_MANAGER', 'FIELD_TECHNICIAN'] },
  { to: '/inventory', label: 'Inventory', icon: 'bi-box-seam', roles: ['ADMIN', 'SAFETY_OFFICER', 'CONTRACTS_MANAGER', 'FIELD_TECHNICIAN'] },
  { to: '/execution', label: 'Maintenance Execution', icon: 'bi-tools', roles: ['ADMIN', 'SAFETY_OFFICER', 'FIELD_TECHNICIAN', 'CONTRACTS_MANAGER'] },
  { to: '/compliance', label: 'Compliance', icon: 'bi-shield-check', roles: ['ADMIN', 'SAFETY_OFFICER', 'CONTRACTS_MANAGER', 'FIELD_TECHNICIAN'] },
  { to: '/supply-chain', label: 'Supply Chain & ERP', icon: 'bi-truck', roles: ['ADMIN', 'CONTRACTS_MANAGER', 'SAFETY_OFFICER'] },
  { to: '/technician-mobile', label: 'Technician Mobile View', icon: 'bi-phone', roles: ['ADMIN', 'FIELD_TECHNICIAN', 'SAFETY_OFFICER'] },
  { to: '/analytics', label: 'Analytics & Reports', icon: 'bi-bar-chart-line', roles: ['ADMIN', 'SAFETY_OFFICER', 'CONTRACTS_MANAGER'] },
  { to: '/users', label: 'User Management', icon: 'bi-people', roles: ['ADMIN'] },
  { to: '/settings', label: 'Settings', icon: 'bi-gear', roles: ['ADMIN', 'SAFETY_OFFICER', 'CONTRACTS_MANAGER', 'FIELD_TECHNICIAN'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(extractResults(res.data));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      loadNotifications();
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleNav = NAV_ITEMS.filter(
    (item) => user?.role === 'ADMIN' || item.roles.includes(user?.role)
  );

  const currentNav = NAV_ITEMS.find((n) => n.to === location.pathname);

  return (
    <div className="ff-shell">
      {sidebarOpen && (
        <div
          className="ff-sidebar-backdrop d-lg-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`ff-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="ff-sidebar-brand d-flex align-items-center justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-2"
                style={{ width: 34, height: 34, background: '#10b981', color: '#0b192c', fontWeight: 800 }}
              >
                <i className="bi bi-airplane-engines-fill"></i>
              </span>
              <div>
                <div className="fw-bold text-white lh-1">FlightFix</div>
                <small className="text-secondary" style={{ fontSize: '0.72rem' }}>
                  Aerospace MRO Suite
                </small>
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-outline-light d-lg-none"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="py-2 flex-grow-1 overflow-auto">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `ff-nav-link ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-top border-secondary border-opacity-25">
          <div className="small text-secondary mb-1">Signed in as</div>
          <div className="fw-semibold text-white text-truncate">{user?.full_name || user?.username}</div>
          <span className="badge text-bg-success mt-1" style={{ fontSize: '0.7rem' }}>
            {(user?.role || '').replace(/_/g, ' ')}
          </span>
        </div>
      </aside>

      <div className="ff-main">
        <header className="ff-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm d-lg-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle navigation"
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <div>
              <h5 className="mb-0 fw-bold">{currentNav ? currentNav.label : 'FlightFix MRO'}</h5>
              <small className="text-muted d-none d-sm-inline">
                FlightFix / {currentNav ? currentNav.label : 'Workspace'}
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 position-relative">
            <button
              className="btn btn-light border position-relative"
              onClick={() => setShowNotifs((v) => !v)}
              title="Notifications"
            >
              <i className="bi bi-bell"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div
                className="ff-card position-absolute end-0 top-100 mt-2 p-3 shadow-lg"
                style={{ width: 320, maxHeight: 380, overflowY: 'auto', zIndex: 1050 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="small">Notifications</strong>
                  <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={markAllRead}>
                    Mark all read
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-muted small mb-0">No notifications.</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded mb-2 border ${n.is_read ? 'bg-light' : 'bg-primary bg-opacity-10 border-primary-subtle'}`}
                    >
                      <div className="fw-semibold small">{n.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
