import React, { useState, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { InventoryItem } from '../../types';
import { Modal } from '../common/Modal';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItem | null;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
}) => {
  const { state, dispatch } = useNGO();

  const [itemId, setItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('20');
  const [destinationCamp, setDestinationCamp] = useState<string>('Camp Hope Delta Sector');
  const [volunteerAssigneeId, setVolunteerAssigneeId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedItem) {
      setItemId(selectedItem.id);
    } else if (state.inventory.length > 0 && !itemId) {
      setItemId(state.inventory[0].id);
    }

    if (state.volunteers.length > 0 && !volunteerAssigneeId) {
      setVolunteerAssigneeId(state.volunteers[0].id);
    }
    setErrors({});
  }, [selectedItem, state.inventory, state.volunteers, isOpen]);

  const currentItem = state.inventory.find(i => i.id === itemId);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!currentItem) {
      errs.item = 'Please select an item to dispatch.';
      setErrors(errs);
      return false;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      errs.quantity = 'Please enter a valid quantity greater than zero.';
    } else if (qty > currentItem.quantity) {
      // Over-dispatch block!
      errs.quantity = `Over-dispatch blocked! Only ${currentItem.quantity} ${currentItem.unit} currently available in stock.`;
    }

    if (!destinationCamp.trim()) {
      errs.destinationCamp = 'Destination camp or field community is required.';
    }

    if (!volunteerAssigneeId) {
      errs.volunteer = 'Please assign an active field volunteer or coordinator.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch({
      type: 'DISPATCH_ITEM',
      payload: {
        itemId,
        quantity: parseInt(quantity, 10),
        destinationCamp: destinationCamp.trim(),
        volunteerAssigneeId,
        notes: notes.trim() || undefined,
      },
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dispatch Relief Supplies to Field Mission" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Item Selector */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Relief Supply Item *</label>
          <select
            value={itemId}
            onChange={e => {
              setItemId(e.target.value);
              setErrors(prev => ({ ...prev, quantity: '' }));
            }}
            className="form-select"
          >
            {state.inventory.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.quantity} {item.unit} in stock - {item.warehouseLocation})
              </option>
            ))}
          </select>
        </div>

        {/* Available Stock Indicator */}
        {currentItem && (
          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: currentItem.quantity > 0 ? 'var(--color-bg-subtle)' : 'var(--color-danger-bg)',
              border: '1px solid',
              borderColor: currentItem.quantity > 0 ? 'var(--color-border)' : 'var(--color-danger-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Warehouse Location:</span>{' '}
              <strong>{currentItem.warehouseLocation}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Available Stock:</span>{' '}
              <strong style={{ color: currentItem.quantity > 0 ? 'var(--color-primary-600)' : 'var(--color-danger)' }}>
                {currentItem.quantity} {currentItem.unit}
              </strong>
            </div>
          </div>
        )}

        {/* Quantity to dispatch */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Quantity to Dispatch *</label>
          <input
            type="number"
            min="1"
            max={currentItem ? currentItem.quantity : undefined}
            value={quantity}
            onChange={e => {
              setQuantity(e.target.value);
              if (errors.quantity) {
                setErrors(prev => ({ ...prev, quantity: '' }));
              }
            }}
            className={`form-input ${errors.quantity ? 'form-input-error' : ''}`}
            placeholder="e.g. 50"
          />
          {errors.quantity && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <AlertCircle size={14} style={{ color: 'var(--color-danger)' }} />
              <span className="form-error-text" style={{ margin: 0 }}>
                {errors.quantity}
              </span>
            </div>
          )}
        </div>

        {/* Destination Camp */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Destination Relief Camp / Clinic *</label>
          <input
            type="text"
            value={destinationCamp}
            onChange={e => setDestinationCamp(e.target.value)}
            className={`form-input ${errors.destinationCamp ? 'form-input-error' : ''}`}
            placeholder="e.g. High-Pass Refugee Shelter Site 3"
          />
          {errors.destinationCamp && (
            <span className="form-error-text">{errors.destinationCamp}</span>
          )}
        </div>

        {/* Volunteer Assignee */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Field Convoy Lead / Assignee *</label>
          <select
            value={volunteerAssigneeId}
            onChange={e => setVolunteerAssigneeId(e.target.value)}
            className="form-select"
          >
            {state.volunteers.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.skills.slice(0, 2).join(', ')}) - {v.location}
              </option>
            ))}
          </select>
        </div>

        {/* Operational Notes */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Distribution Manifest Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="form-textarea"
            placeholder="Emergency dispatch instructions, delivery timeline, or contact info..."
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
            <Send size={16} />
            <span>Confirm &amp; Record Dispatch</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
