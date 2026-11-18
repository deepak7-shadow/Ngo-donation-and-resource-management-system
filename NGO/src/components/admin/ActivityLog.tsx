import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Activity,
  Heart,
  Boxes,
  Users,
  PieChart,
  Layers,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { ActivityCategory } from '../../types';
import { formatTimeAgo, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportHelpers';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';

export const ActivityLogViewer: React.FC = () => {
  const { state } = useNGO();

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return state.activityLogs.filter(log => {
      const q = search.toLowerCase();
      const matchesSearch =
        log.action.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === 'all' || log.category === (categoryFilter as ActivityCategory);

      const matchesRole = roleFilter === 'all' || log.role === roleFilter;

      return matchesSearch && matchesCategory && matchesRole;
    });
  }, [state.activityLogs, search, categoryFilter, roleFilter]);

  const handleExportCSV = () => {
    const rows = filteredLogs.map(l => ({
      'Action ID': l.id,
      'Timestamp': l.timestamp,
      'Action': l.action,
      'Initiator': l.user,
      'Role': l.role,
      'Category': l.category,
      'Details': l.details,
    }));
    exportToCSV('HopeSphere_Activity_Audit_Log', rows);
  };

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'donation':
        return <Heart size={15} style={{ color: 'var(--color-primary-600)' }} />;
      case 'inventory':
        return <Boxes size={15} style={{ color: 'var(--color-teal-600)' }} />;
      case 'volunteer':
        return <Users size={15} style={{ color: 'var(--color-accent-500)' }} />;
      case 'expense':
        return <PieChart size={15} style={{ color: 'var(--color-danger)' }} />;
      case 'campaign':
        return <Layers size={15} style={{ color: 'var(--color-info)' }} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge variant="warning">Admin</Badge>;
      case 'Donor':
        return <Badge variant="success">Donor</Badge>;
      case 'Volunteer':
        return <Badge variant="info">Volunteer</Badge>;
      default:
        return <Badge variant="neutral">System</Badge>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 'var(--space-6)' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0 }}>
            Chronological System Mutation &amp; Activity Log
          </h4>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleExportCSV}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Download size={14} />
          <span>Export Audit Trail CSV</span>
        </button>
      </div>

      {/* Filter Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-subtle)',
            }}
          />
          <input
            type="text"
            placeholder="Search action, user, or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', margin: 0, fontSize: 'var(--text-xs)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.65rem', fontSize: 'var(--text-xs)' }}
          >
            <option value="all">All Event Categories</option>
            <option value="donation">Donations</option>
            <option value="inventory">Inventory Dispatches</option>
            <option value="volunteer">Volunteer Hours</option>
            <option value="expense">Expenses</option>
            <option value="campaign">Campaigns</option>
          </select>
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="form-select"
          style={{ width: 'auto', padding: '0.45rem 0.65rem', fontSize: 'var(--text-xs)' }}
        >
          <option value="all">All Actor Roles</option>
          <option value="Donor">Donor</option>
          <option value="Volunteer">Volunteer</option>
          <option value="Admin">Admin</option>
          <option value="System">System Bot</option>
        </select>
      </div>

      {/* Activity Timeline Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No activity events found"
          description="Try relaxing your search terms or category filters."
        />
      ) : (
        <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Initiator</th>
                <th>Role</th>
                <th>Operation Details</th>
                <th style={{ textAlign: 'right' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-bg-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {getCategoryIcon(log.category)}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)' }}>
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>{log.user}</span>
                  </td>
                  <td>{getRoleBadge(log.role)}</td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {log.details}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                      {formatTimeAgo(log.timestamp)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
                      {formatDate(log.timestamp, 'MMM dd, HH:mm')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
