import React, { useState } from 'react';
import { PlusCircle, CheckCircle } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { ExpenseCategory } from '../../types';
import { Modal } from '../common/Modal';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useNGO();

  const [invoiceRef, setInvoiceRef] = useState<string>('INV-2026-' + Math.floor(120 + Math.random() * 880));
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('direct-aid');
  const [project, setProject] = useState<string>(
    state.campaigns[0]?.title || 'Clean Water for Arid Communities'
  );
  const [amount, setAmount] = useState<string>('4500');
  const [vendor, setVendor] = useState<string>('');
  const [verifiedBy, setVerifiedBy] = useState<string>('Field Operations Director');
  const [description, setDescription] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!invoiceRef.trim()) errs.invoiceRef = 'Invoice Reference is required.';
    if (!date) errs.date = 'Invoice date is required.';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) errs.amount = 'Valid positive amount is required.';
    if (!vendor.trim()) errs.vendor = 'Vendor / Contractor name is required.';
    if (!description.trim() || description.trim().length < 8) {
      errs.description = 'Please provide a clear description of goods or services (min 8 chars).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        invoiceRef: invoiceRef.trim(),
        date,
        category,
        project,
        amount: parseFloat(amount),
        vendor: vendor.trim(),
        verified: true,
        verifiedBy: verifiedBy.trim() || 'Internal Auditor',
        description: description.trim(),
      },
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Verified Expenditure Invoice" size="lg">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Invoice Ref / Bill No. *</label>
            <input
              type="text"
              value={invoiceRef}
              onChange={e => setInvoiceRef(e.target.value)}
              className={`form-input ${errors.invoiceRef ? 'form-input-error' : ''}`}
              placeholder="e.g. INV-2026-112"
            />
            {errors.invoiceRef && <span className="form-error-text">{errors.invoiceRef}</span>}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Invoice Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={`form-input ${errors.date ? 'form-input-error' : ''}`}
            />
            {errors.date && <span className="form-error-text">{errors.date}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Expense Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}
              className="form-select"
            >
              <option value="direct-aid">Direct Aid (Relief Supplies &amp; Equipment)</option>
              <option value="medical">Medical (Medicines, Vaccines &amp; Devices)</option>
              <option value="education">Education (Learning Hubs &amp; Tablets)</option>
              <option value="emergency">Emergency Response (Rescue Tools &amp; Tents)</option>
              <option value="logistics">Logistics (Freight, 4x4 Fleet &amp; Fuel)</option>
              <option value="admin">Governance &amp; Statutory Auditing</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Target Campaign / Project *</label>
            <select
              value={project}
              onChange={e => setProject(e.target.value)}
              className="form-select"
            >
              {state.campaigns.map(c => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
              <option value="Operational Overhead & Governance">Operational Overhead &amp; Governance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Amount in USD ($) *</label>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`form-input ${errors.amount ? 'form-input-error' : ''}`}
              placeholder="e.g. 8500"
            />
            {errors.amount && <span className="form-error-text">{errors.amount}</span>}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Vendor / Contractor Name *</label>
            <input
              type="text"
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              className={`form-input ${errors.vendor ? 'form-input-error' : ''}`}
              placeholder="e.g. SolarPumps International Ltd."
            />
            {errors.vendor && <span className="form-error-text">{errors.vendor}</span>}
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Verified By (Auditor / Trustee) *</label>
          <input
            type="text"
            value={verifiedBy}
            onChange={e => setVerifiedBy(e.target.value)}
            className="form-input"
            placeholder="Field Operations Lead / Grant Inspector"
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Detailed Line-Item Description *</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`form-textarea ${errors.description ? 'form-input-error' : ''}`}
            placeholder="Specify exact quantities, model numbers, or operational deliverables purchased..."
          />
          {errors.description && <span className="form-error-text">{errors.description}</span>}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-bg-subtle)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          <span>
            This record will be immediately stamped, signed, and published to the public transparency ledger for open inspection.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <PlusCircle size={16} />
            <span>Commit to Ledger</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
