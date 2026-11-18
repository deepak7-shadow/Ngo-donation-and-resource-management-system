import React, { useState, useEffect } from 'react';
import { PlusCircle, Check } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { InventoryItem, InventoryCategory } from '../../types';
import { Modal } from '../common/Modal';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: InventoryItem | null;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { dispatch } = useNGO();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<InventoryCategory>('food');
  const [quantity, setQuantity] = useState<string>('100');
  const [unit, setUnit] = useState<string>('boxes');
  const [warehouseLocation, setWarehouseLocation] = useState<string>('Central Hub - Bay A1');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('30');
  const [costPerUnit, setCostPerUnit] = useState<string>('25');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setQuantity(itemToEdit.quantity.toString());
      setUnit(itemToEdit.unit);
      setWarehouseLocation(itemToEdit.warehouseLocation);
      setLowStockThreshold(itemToEdit.lowStockThreshold.toString());
      setCostPerUnit(itemToEdit.costPerUnit.toString());
    } else {
      setName('');
      setCategory('food');
      setQuantity('100');
      setUnit('boxes');
      setWarehouseLocation('Central Hub - Bay A1');
      setLowStockThreshold('30');
      setCostPerUnit('25');
    }
    setErrors({});
  }, [itemToEdit, isOpen]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Item name is required.';
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) errs.quantity = 'Quantity must be a non-negative number.';
    if (!unit.trim()) errs.unit = 'Unit is required (e.g. kits, boxes, kg).';
    if (!warehouseLocation.trim()) errs.warehouseLocation = 'Warehouse location is required.';
    const thresh = parseInt(lowStockThreshold, 10);
    if (isNaN(thresh) || thresh < 1) errs.lowStockThreshold = 'Threshold must be at least 1.';
    const cost = parseFloat(costPerUnit);
    if (isNaN(cost) || cost < 0) errs.costPerUnit = 'Cost per unit must be a valid number.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedQty = parseInt(quantity, 10);
    const parsedThresh = parseInt(lowStockThreshold, 10);
    const parsedCost = parseFloat(costPerUnit);

    if (itemToEdit) {
      dispatch({
        type: 'UPDATE_INVENTORY_ITEM',
        payload: {
          ...itemToEdit,
          name: name.trim(),
          category,
          quantity: parsedQty,
          unit: unit.trim(),
          warehouseLocation: warehouseLocation.trim(),
          lowStockThreshold: parsedThresh,
          costPerUnit: parsedCost,
        },
      });
    } else {
      dispatch({
        type: 'ADD_INVENTORY_ITEM',
        payload: {
          name: name.trim(),
          category,
          quantity: parsedQty,
          unit: unit.trim(),
          warehouseLocation: warehouseLocation.trim(),
          lowStockThreshold: parsedThresh,
          lastRestocked: new Date().toISOString().split('T')[0],
          costPerUnit: parsedCost,
        },
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? 'Edit Relief Inventory Item' : 'Add Relief Supplies to Inventory'}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Item / Supply Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
            placeholder="e.g. Sterile Pediatric First Aid Kits"
          />
          {errors.name && <span className="form-error-text">{errors.name}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as InventoryCategory)}
              className="form-select"
            >
              <option value="food">Food &amp; Nutrition</option>
              <option value="medical">Medical &amp; Surgical</option>
              <option value="blankets">Blankets &amp; Thermal</option>
              <option value="education">Education &amp; STEM</option>
              <option value="shelter">Shelter &amp; Hardware</option>
              <option value="hygiene">Water &amp; Hygiene</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Warehouse Staging Bay *</label>
            <input
              type="text"
              value={warehouseLocation}
              onChange={e => setWarehouseLocation(e.target.value)}
              className={`form-input ${errors.warehouseLocation ? 'form-input-error' : ''}`}
              placeholder="e.g. Central Hub - Bay B2"
            />
            {errors.warehouseLocation && (
              <span className="form-error-text">{errors.warehouseLocation}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Initial Stock Quantity *</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className={`form-input ${errors.quantity ? 'form-input-error' : ''}`}
            />
            {errors.quantity && <span className="form-error-text">{errors.quantity}</span>}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Stock Unit *</label>
            <input
              type="text"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className={`form-input ${errors.unit ? 'form-input-error' : ''}`}
              placeholder="boxes, kits, units, kg"
            />
            {errors.unit && <span className="form-error-text">{errors.unit}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Low Stock Alert Threshold *</label>
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={e => setLowStockThreshold(e.target.value)}
              className={`form-input ${errors.lowStockThreshold ? 'form-input-error' : ''}`}
            />
            {errors.lowStockThreshold && (
              <span className="form-error-text">{errors.lowStockThreshold}</span>
            )}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Cost Value Per Unit ($) *</label>
            <input
              type="number"
              min="0"
              step="any"
              value={costPerUnit}
              onChange={e => setCostPerUnit(e.target.value)}
              className={`form-input ${errors.costPerUnit ? 'form-input-error' : ''}`}
            />
            {errors.costPerUnit && <span className="form-error-text">{errors.costPerUnit}</span>}
          </div>
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
            {itemToEdit ? <Check size={16} /> : <PlusCircle size={16} />}
            <span>{itemToEdit ? 'Save Changes' : 'Add Item to Catalog'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
