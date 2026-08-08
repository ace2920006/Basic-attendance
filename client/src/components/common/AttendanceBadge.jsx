import React from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function AttendanceBadge({ status }) {
  const getBadgeConfig = () => {
    switch (status?.toLowerCase()) {
      case 'present':
        return { className: 'badge-present', icon: <FiCheckCircle className="w-3.5 h-3.5" />, label: 'Present' };
      case 'absent':
        return { className: 'badge-absent', icon: <FiXCircle className="w-3.5 h-3.5" />, label: 'Absent' };
      case 'late':
        return { className: 'badge-late', icon: <FiClock className="w-3.5 h-3.5" />, label: 'Late' };
      case 'warning':
        return { className: 'badge-absent', icon: <FiAlertCircle className="w-3.5 h-3.5" />, label: 'Warning' };
      case 'marked':
        return { className: 'badge-present', icon: <FiCheckCircle className="w-3.5 h-3.5" />, label: 'Marked' };
      default:
        return { className: 'badge-pending', icon: <FiClock className="w-3.5 h-3.5" />, label: status || 'Pending' };
    }
  };

  const { className, icon, label } = getBadgeConfig();

  return (
    <span className={`badge ${className}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
