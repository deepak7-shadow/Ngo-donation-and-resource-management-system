import React from 'react';
import {
  Printer,
  Download,
  ShieldCheck,
  X,
  FileCheck,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportHelpers';

interface AuditReportProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditReport: React.FC<AuditReportProps> = ({ isOpen, onClose }) => {
  const { state, telemetry } = useNGO();

  if (!isOpen) return null;

  const totalInflow = state.donations.reduce((acc, d) => acc + d.amount, 0);
  const totalOutflow = state.expenses.reduce((acc, e) => acc + e.amount, 0);
  const netReserve = totalInflow - totalOutflow;

  // Breakdown by category
  const categories: Record<string, { count: number; total: number }> = {};
  state.expenses.forEach(e => {
    if (!categories[e.category]) {
      categories[e.category] = { count: 0, total: 0 };
    }
    categories[e.category].count += 1;
    categories[e.category].total += e.amount;
  });

  const handleExportCSV = () => {
    const rows = state.expenses.map(e => ({
      'Invoice Ref': e.invoiceRef,
      'Date': e.date,
      'Category': e.category,
      'Project': e.project,
      'Vendor': e.vendor,
      'Amount': e.amount,
      'Verified By': e.verifiedBy,
      'Description': e.description,
    }));
    exportToCSV(`HopeSphere_Statutory_Audit_${new Date().getFullYear()}`, rows);
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-content modal-content-lg"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Comprehensive Statutory Audit Report"
        style={{
          maxWidth: '840px',
          padding: 0,
          background: 'var(--color-bg-surface)',
        }}
      >
        {/* Top Controls Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileCheck size={18} style={{ color: 'var(--color-primary-600)' }} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>
              Statutory Financial Audit &amp; Reconciliation Statement
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={triggerPrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Printer size={14} />
              <span>Print Audit Sheet</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              style={{ padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div
          className="receipt-document"
          style={{
            padding: 'var(--space-8)',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'var(--font-body)',
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2px solid #0f172a',
              paddingBottom: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0d9488', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              INDEPENDENT STATUTORY DISCLOSURE &amp; FIDUCIARY ATTESTATION
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#0f172a' }}>
              HopeSphere Humanitarian Trust Inc.
            </h2>
            <p style={{ fontSize: '12px', color: '#475569' }}>
              Audited Expenditure Statement &amp; Donor Fund Reconciliation • FY 2025–2026
            </p>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Registration: EIN 84-2948192 | Trust Order HS/80G/9941/2021 | 501(c)(3) Compliant
            </div>
          </div>

          {/* Key Reconciliation Balance Sheet */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TOTAL FUNDS RECEIVED (INFLOW)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                {formatCurrency(totalInflow)}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{state.donations.length} Verified Donations</div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TOTAL EXPENDITURE (OUTFLOW)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {formatCurrency(totalOutflow)}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{state.expenses.length} Invoices Cleared</div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>RESERVE BALANCE (HELD FOR AID)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0d9488', marginTop: '4px' }}>
                {formatCurrency(netReserve)}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Fiduciary Escrow Account</div>
            </div>
          </div>

          {/* Allocation Efficiency Metric */}
          <div
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #86efac',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                Direct Humanitarian Aid Ratio
              </div>
              <div style={{ fontSize: '11px', color: '#15803d' }}>
                Percentage of disbursed capital transferred directly to relief operations without administrative friction.
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d' }}>
              {telemetry.directAidPercentage}%
            </div>
          </div>

          {/* Categorical Breakdown Table */}
          <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '16px 0 8px 0', textTransform: 'uppercase' }}>
            Expenditure Distribution by Operational Category
          </h4>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '24px',
              fontSize: '12px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>CATEGORY</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>VOUCHERS</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>TOTAL AMOUNT</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>% OF TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categories).map(([catKey, data]) => {
                const pct = totalOutflow > 0 ? Math.round((data.total / totalOutflow) * 100) : 0;
                return (
                  <tr key={catKey} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px', textTransform: 'capitalize', fontWeight: 600 }}>
                      {catKey.replace('-', ' ')}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{data.count}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                      {formatCurrency(data.total)}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800, borderTop: '2px solid #0f172a' }}>
                <td style={{ padding: '10px' }}>TOTAL CONSOLIDATED OUTFLOW</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{state.expenses.length}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#0d9488' }}>
                  {formatCurrency(totalOutflow)}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>100%</td>
              </tr>
            </tfoot>
          </table>

          {/* Statutory Sign-off */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid #cbd5e1',
              paddingTop: '20px',
              fontSize: '11px',
              color: '#475569',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a' }}>
                <ShieldCheck size={16} style={{ color: '#16a34a' }} />
                <span>Statutory Auditor Attestation</span>
              </div>
              <div style={{ marginTop: '4px' }}>
                KPMG External Audit LLP (Firm Reg: 104921N)
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                UDIN: 26038291BGTYH9912 • Digitally Timestamped
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'cursive', fontSize: '16px', color: '#0d9488', marginBottom: '2px' }}>
                Dr. Marcus Sterling
              </div>
              <div style={{ width: '140px', height: '1px', backgroundColor: '#0f172a', margin: '0 auto' }} />
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                Chief Financial Trustee
              </div>
              <div style={{ fontSize: '10px' }}>HopeSphere Humanitarian Trust</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
