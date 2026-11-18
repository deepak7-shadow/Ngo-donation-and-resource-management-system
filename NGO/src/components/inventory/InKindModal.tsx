import React, { useState, useEffect } from 'react';
import { PackagePlus } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { InventoryItem } from '../../types';
import { Modal } from '../common/Modal';

interface InKindModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItem | null;
}

export const InKindModal: React.FC<InKindModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
}) => {
  const { state, dispatch } = useNGO();

  const [itemId, setItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('50');
  const [donorName, setDonorName] = useState<string>('National Grain Federation');
  const [notes, setNotes] = useState<string>('Emergency shipment received at central staging depot.');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedItem) {
      setItemId(selectedItem.id);
    } else if (state.inventory.length > 0 && !itemId) {
      setItemId(state.inventory[0].id);
    }
    setErrors({});
  }, [selectedItem, state.inventory, isOpen]);

  const currentItem = state.inventory.find(i => i.id === itemId);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!currentItem) errs.item = 'Please select an item.';
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) errs.quantity = 'Quantity must be a positive integer.';
    if (!donorName.trim()) errs.donorName = 'Donor or Corporate partner name is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch({
      type: 'RECEIVE_INKIND_DONATION',
      payload: {
        itemId,
        quantity: parseInt(quantity, 10),
        donorName: donorName.trim(),
        notes: notes.trim() || undefined,
      },
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log In-Kind Physical Relief Donation" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Relief Supply to Replenish *</label>
          <select
            value={itemId}
            onChange={e => setItemId(e.target.value)}
            className="form-select"
          >
            {state.inventory.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} (Current: {item.quantity} {item.unit})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Quantity Received *</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className={`form-input ${errors.quantity ? 'form-input-error' : ''}`}
            />
            {errors.quantity && <span className="form-error-text">{errors.quantity}</span>}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Unit of Measure</label>
            <input
              type="text"
              readOnly
              value={currentItem ? currentItem.unit : 'units'}
              className="form-input"
              style={{ backgroundColor: 'var(--color-bg-muted)' }}
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Donor Name / Corporation *</label>
          <input
            type="text"
            value={donorName}
            onChange={e => setDonorName(e.target.value)}
            className={`form-input ${errors.donorName ? 'form-input-error' : ''}`}
            placeholder="e.g. UNICEF Regional Warehouse or Local Bakeries"
          />
          {errors.donorName && <span className="form-error-text">{errors.donorName}</span>}
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Receipt &amp; Staging Memo</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="form-textarea"
            placeholder="Batch numbers, expiry verification, or donor notes..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PackagePlus size={16} />
            <span>Increase Stock Level</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
