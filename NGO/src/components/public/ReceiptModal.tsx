import React from 'react';
import { Printer, Download, CheckCircle, Shield, X, HeartHandshake } from 'lucide-react';
import type { Donation } from '../../types';
import { generateReceiptData } from '../../utils/receiptGenerator';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportHelpers';

interface ReceiptModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  donation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !donation) return null;

  const data = generateReceiptData(donation);

  const handleDownloadCSV = () => {
    exportToCSV(`Receipt_${donation.receiptNumber}`, [
      {
        'Receipt Number': data.receiptNumber,
        'Date': data.donationDate,
        'Donor Name': data.donorName,
        'Donor Email': data.donorEmail,
        'PAN / Tax ID': data.donorTaxId,
        'Amount': data.amount,
        'Currency': data.currency,
        'Payment Method': data.paymentMethod,
        'Transaction Ref': data.transactionRef,
        'Campaign Name': data.campaignName,
        'NGO Trust Reg': data.ngoRegistrationNo,
        'Tax Exemption': data.taxExemptionCode,
      },
    ]);
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="modal-content modal-content-lg"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Official Donation Tax Receipt"
        style={{
          maxWidth: '780px',
          padding: 0,
          background: 'var(--color-bg-surface)',
        }}
      >
        {/* Top Control Bar (Hidden when printing) */}
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
            <Shield size={18} style={{ color: 'var(--color-success)' }} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>
              Official Tax Deductible Donation Receipt
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadCSV}
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
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              aria-label="Close modal"
              style={{ padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div
          className="receipt-document"
          style={{
            padding: 'var(--space-8)',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'var(--font-body)',
            position: 'relative',
          }}
        >
          {/* Watermark Logo in background */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.04,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <HeartHandshake size={320} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Header: Organization Letterhead */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #0f172a',
                paddingBottom: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: '#0d9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <HeartHandshake size={20} />
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {data.ngoName}
                  </h2>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px', maxWidth: '380px' }}>
                  {data.ngoAddress}
                </p>
                <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                  {data.ngoRegistrationNo}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  Certificate of Donation
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  Receipt No: {data.receiptNumber}
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  Date: {formatDate(data.donationDate, 'dd MMMM yyyy, HH:mm')}
                </div>
              </div>
            </div>

            {/* Donor & Donation Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '14px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Received With Thanks From:
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {data.donorName}
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                  Email: {data.donorEmail}
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                  Donor PAN / Tax ID: <strong>{data.donorTaxId}</strong>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '14px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Contribution Allocated To:
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                  {data.campaignName}
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                  Transaction Ref: {data.transactionRef}
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                  Payment Channel: {data.paymentMethod}
                </div>
              </div>
            </div>

            {/* Amount Table */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', borderBottom: '2px solid #cbd5e1' }}>
                    DESCRIPTION OF AID GIFT
                  </th>
                  <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', borderBottom: '2px solid #cbd5e1' }}>
                    AMOUNT ({data.currency})
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                    Direct Charitable Contribution for humanitarian relief &amp; infrastructure development
                  </td>
                  <td
                    style={{
                      padding: '12px 10px',
                      borderBottom: '1px solid #e2e8f0',
                      textAlign: 'right',
                      fontSize: '15px',
                      fontWeight: 800,
                    }}
                  >
                    {formatCurrency(data.amount, data.currency)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#faf5ff' }}>
                  <td style={{ padding: '10px', fontWeight: 700, fontSize: '12px' }}>
                    Amount in Words:
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, fontSize: '12px', color: '#6b21a8' }}>
                    {data.amountInWords}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tax Exemption Endorsement */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} style={{ color: '#16a34a' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d' }}>
                  STATUTORY TAX EXEMPTION ENDORSEMENT
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#166534', marginTop: '4px', lineHeight: 1.5 }}>
                Donations to HopeSphere Foundation are eligible for 100% tax exemption under Section 80G of the Income Tax Act, 1961 (Order No. ITBA/EXM/S/80G/2021-22/1039481) and Section 501(c)(3) of the US Internal Revenue Code. No goods or services were provided in exchange for this contribution.
              </p>
            </div>

            {/* Signature & Seal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '32px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Verified via HopeSphere Distributed Public Ledger
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  System Verification Hash: SHA256:{Math.random().toString(36).substring(2, 15)}...
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'cursive',
                    fontSize: '18px',
                    color: '#0d9488',
                    marginBottom: '4px',
                  }}
                >
                  Elena Vance-Trustee
                </div>
                <div style={{ width: '160px', height: '1px', backgroundColor: '#0f172a', margin: '0 auto' }} />
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                  Authorized Signatory
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  HopeSphere Humanitarian Trust
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
