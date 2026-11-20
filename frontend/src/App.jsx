import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import AircraftPage from './pages/AircraftPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CompliancePage from './pages/CompliancePage';
import DashboardPage from './pages/DashboardPage';
import ExecutionPage from './pages/ExecutionPage';
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import MaintenancePage from './pages/MaintenancePage';
import SettingsPage from './pages/SettingsPage';
import SupplyChainPage from './pages/SupplyChainPage';
import TechnicianMobilePage from './pages/TechnicianMobilePage';
import UsersPage from './pages/UsersPage';
import WorkOrdersPage from './pages/WorkOrdersPage';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && user.role !== 'ADMIN' && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="workorders" element={<WorkOrdersPage />} />
            <Route path="aircraft" element={<AircraftPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="execution" element={<ExecutionPage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route
              path="supply-chain"
              element={
                <ProtectedRoute roles={['ADMIN', 'CONTRACTS_MANAGER', 'SAFETY_OFFICER']}>
                  <SupplyChainPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="technician-mobile"
              element={
                <ProtectedRoute roles={['ADMIN', 'FIELD_TECHNICIAN', 'SAFETY_OFFICER']}>
                  <TechnicianMobilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute roles={['ADMIN', 'SAFETY_OFFICER', 'CONTRACTS_MANAGER']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
