import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  FileCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  Building,
  CheckCircle,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { ExpenseCategory } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportHelpers';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { ExpenseModal } from './ExpenseModal';
import { AuditReport } from './AuditReport';

export const TransparencyLedger: React.FC = () => {
  const { state, telemetry } = useNGO();

  // Search & Filters
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'vendor'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [isAuditReportOpen, setIsAuditReportOpen] = useState<boolean>(false);

  // Filtered & Sorted Expenses
  const filteredExpenses = useMemo(() => {
    return state.expenses
      .filter(expense => {
        const query = search.toLowerCase();
        const matchesSearch =
          expense.invoiceRef.toLowerCase().includes(query) ||
          expense.vendor.toLowerCase().includes(query) ||
          expense.description.toLowerCase().includes(query) ||
          expense.project.toLowerCase().includes(query);

        const matchesCategory =
          categoryFilter === 'all' || expense.category === categoryFilter;

        const matchesProject =
          projectFilter === 'all' || expense.project === projectFilter;

        const matchesStart = !startDate || expense.date >= startDate;
        const matchesEnd = !endDate || expense.date <= endDate;

        return matchesSearch && matchesCategory && matchesProject && matchesStart && matchesEnd;
      })
      .sort((a, b) => {
        if (sortBy === 'amount') {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
        if (sortBy === 'vendor') {
          return sortOrder === 'desc'
            ? b.vendor.localeCompare(a.vendor)
            : a.vendor.localeCompare(b.vendor);
        }
        // Default: Date
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [state.expenses, search, categoryFilter, projectFilter, startDate, endDate, sortBy, sortOrder]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const handleExportCSV = () => {
    const rows = filteredExpenses.map(e => ({
      'Invoice Ref': e.invoiceRef,
      'Date': e.date,
      'Category': e.category,
      'Project': e.project,
      'Vendor': e.vendor,
      'Amount (USD)': e.amount,
      'Verified By': e.verifiedBy,
      'Description': e.description,
    }));
    exportToCSV('HopeSphere_Expenditure_Ledger', rows);
  };

  const getCategoryBadge = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'direct-aid':
        return <Badge variant="success">Direct Aid</Badge>;
      case 'medical':
        return <Badge variant="info">Medical</Badge>;
      case 'education':
        return <Badge variant="info">Education</Badge>;
      case 'emergency':
        return <Badge variant="danger">Emergency</Badge>;
      case 'logistics':
        return <Badge variant="warning">Logistics</Badge>;
      case 'admin':
        return <Badge variant="neutral">Audit / Admin</Badge>;
      default:
        return <Badge variant="neutral">{cat}</Badge>;
    }
  };

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [filteredExpenses]);

  return (
    <section style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        {/* Header Ribbon */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div>
            <div className="badge badge-success" style={{ marginBottom: 'var(--space-2)' }}>
              100% Verifiable Public Ledger
            </div>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>
              Expenditure Ledger &amp; Field Invoices
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '640px' }}>
              Every single operational disbursement is publicly recorded with external vendor invoice references, auditor sign-offs, and allocation categories.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAuditReportOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FileCheck size={14} />
              <span>Statutory Audit Report</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsExpenseModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={14} />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingDown size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Verified Disbursements
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                {formatCurrency(totalFilteredAmount)}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Direct Aid Efficiency
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                {telemetry.directAidPercentage}% to Frontlines
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(13, 148, 136, 0.12)',
                color: 'var(--color-teal-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Audited Vendor Accounts
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                {new Set(state.expenses.map(e => e.vendor)).size} Suppliers
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          className="glass-panel"
          style={{
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-subtle)',
                }}
              />
              <input
                type="text"
                placeholder="Search invoice, vendor, or project..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input"
                style={{ paddingLeft: '36px', margin: 0, fontSize: 'var(--text-xs)' }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
              <select
                value={categoryFilter}
                onChange={e => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: 'var(--text-xs)' }}
              >
                <option value="all">All Categories</option>
                <option value="direct-aid">Direct Aid</option>
                <option value="medical">Medical</option>
                <option value="education">Education</option>
                <option value="emergency">Emergency Relief</option>
                <option value="logistics">Logistics &amp; Transport</option>
                <option value="admin">Governance &amp; Audits</option>
              </select>
            </div>

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={e => {
                setProjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: 'var(--text-xs)' }}
            >
              <option value="all">All Missions / Projects</option>
              {state.campaigns.map(c => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
              <option value="Operational Overhead & Governance">Operational Overhead</option>
            </select>

            {/* Date Range Start / End */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input"
                style={{ padding: '0.35rem 0.5rem', fontSize: 'var(--text-xs)', width: 'auto' }}
                title="Start Date"
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input"
                style={{ padding: '0.35rem 0.5rem', fontSize: 'var(--text-xs)', width: 'auto' }}
                title="End Date"
              />
            </div>

            {/* Sort Order */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'date' | 'amount' | 'vendor')}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: 'var(--text-xs)' }}
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="vendor">Sort by Vendor</option>
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                title="Toggle sort direction"
                style={{ padding: '0.45rem 0.65rem', fontSize: 'var(--text-xs)' }}
              >
                {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
              </button>
            </div>
          </div>
        </div>

        {/* Expenses Data Table */}
        {filteredExpenses.length === 0 ? (
          <EmptyState
            title="No ledger entries found"
            description="No expenditures match your query criteria. Try adjusting your filters or search keywords."
            actionText="Clear Filters"
            onAction={() => {
              setSearch('');
              setCategoryFilter('all');
              setProjectFilter('all');
              setStartDate('');
              setEndDate('');
            }}
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Ref</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Target Project</th>
                  <th>Vendor / Supplier</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount (USD)</th>
                  <th style={{ textAlign: 'center' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                        {item.invoiceRef}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(item.date)}</td>
                    <td>{getCategoryBadge(item.category)}</td>
                    <td style={{ maxWidth: '200px' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={item.project}
                      >
                        {item.project}
                      </div>
                    </td>
                    <td style={{ maxWidth: '180px' }}>
                      <div
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 500,
                        }}
                        title={item.vendor}
                      >
                        {item.vendor}
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={item.description}
                      >
                        {item.description}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-text-main)' }}>
                      {formatCurrency(item.amount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className="badge badge-success"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}
                        title={`Verified by ${item.verifiedBy}`}
                      >
                        <CheckCircle size={11} />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredExpenses.length > itemsPerPage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'var(--space-4)',
              padding: 'var(--space-2) var(--space-4)',
            }}
          >
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} entries
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Expense Modal */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
        />

        {/* Audit Statement Modal */}
        <AuditReport
          isOpen={isAuditReportOpen}
          onClose={() => setIsAuditReportOpen(false)}
        />
      </div>
    </section>
  );
};
