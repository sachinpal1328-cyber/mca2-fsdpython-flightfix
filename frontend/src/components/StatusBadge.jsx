import React from 'react';

const STATUS_MAP = {
  OPERATIONAL: 'success',
  SERVICEABLE: 'success',
  COMPLIANT: 'success',
  COMPLETED: 'success',
  PASS: 'success',
  ACTIVE: 'success',
  RECEIVED: 'success',
  IN_PROGRESS: 'primary',
  STARTED: 'primary',
  APPROVED: 'primary',
  ORDERED: 'info',
  SCHEDULED: 'info',
  OPEN: 'info',
  SIMULATED: 'info',
  PENDING: 'warning',
  ON_HOLD: 'warning',
  PAUSED: 'warning',
  NEEDS_INSPECTION: 'warning',
  EXPIRING_SOON: 'warning',
  CONDITIONAL: 'warning',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'danger',
  OVERDUE: 'danger',
  EXPIRED: 'danger',
  NON_COMPLIANT: 'danger',
  UNSERVICEABLE: 'danger',
  GROUNDED: 'danger',
  AOG: 'danger',
  FAIL: 'danger',
  REJECTED: 'danger',
  FAILED: 'danger',
  LOW: 'secondary',
  ARCHIVED: 'secondary',
  CANCELLED: 'secondary',
  INACTIVE: 'secondary',
  DRAFT: 'secondary',
};

export default function StatusBadge({ value }) {
  const variant = STATUS_MAP[value] || 'secondary';
  const label = (value || 'UNKNOWN').replace(/_/g, ' ');
  return <span className={`badge text-bg-${variant}`}>{label}</span>;
}
