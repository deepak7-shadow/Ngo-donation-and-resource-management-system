import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Download,
  Send,
  PackagePlus,
  Edit2,
  Trash2,
  Boxes,
  Truck,
  AlertTriangle,
  History,
  CheckCircle,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { InventoryItem, InventoryCategory, StockStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportHelpers';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { LowStockAlerts } from './LowStockAlerts';
import { AddItemModal } from './AddItemModal';
import { DispatchModal } from './DispatchModal';
import { InKindModal } from './InKindModal';

export const StockTable: React.FC = () => {
  const { state, dispatch } = useNGO();

  const [activeTab, setActiveTab] = useState<'stock' | 'dispatches'>('stock');
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [isInKindModalOpen, setIsInKindModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return state.inventory.filter(item => {
      const q = search.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.warehouseLocation.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === 'all' || item.category === (categoryFilter as InventoryCategory);

      const matchesStatus =
        statusFilter === 'all' || item.status === (statusFilter as StockStatus);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [state.inventory, search, categoryFilter, statusFilter]);

  const handleExportStockCSV = () => {
    const rows = filteredInventory.map(item => ({
      'Item ID': item.id,
      'Name': item.name,
      'Category': item.category,
      'Available Quantity': item.quantity,
      'Unit': item.unit,
      'Warehouse Bay': item.warehouseLocation,
      'Low Stock Threshold': item.lowStockThreshold,
      'Status': item.status,
      'Unit Cost': item.costPerUnit,
      'Last Restocked': item.lastRestocked,
    }));
    exportToCSV('HopeSphere_Relief_Inventory', rows);
  };

  const handleExportDispatchesCSV = () => {
    const rows = state.dispatches.map(d => ({
      'Dispatch ID': d.id,
      'Item Name': d.itemName,
      'Quantity': d.quantity,
      'Unit': d.unit,
      'Destination Camp': d.destinationCamp,
      'Assignee Volunteer': d.volunteerAssigneeName,
      'Dispatch Date': d.dispatchDate,
      'Status': d.status,
      'Notes': d.notes || '',
    }));
    exportToCSV('HopeSphere_Dispatches_Manifest', rows);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: id });
    }
  };

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'critical':
        return <Badge variant="danger">Critical Alert</Badge>;
      case 'low-stock':
        return <Badge variant="warning">Low Stock</Badge>;
      default:
        return <Badge variant="success">In Stock</Badge>;
    }
  };

  // Inventory stats
  const totalUnits = state.inventory.reduce((acc, i) => acc + i.quantity, 0);
  const totalValuation = state.inventory.reduce((acc, i) => acc + i.quantity * i.costPerUnit, 0);
  const lowStockCount = state.inventory.filter(i => i.status !== 'in-stock').length;

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
              Real-Time Humanitarian Logistics
            </div>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>
              Relief Supplies &amp; Warehouse Inventory
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '640px' }}>
              Track medical supplies, emergency food packs, thermal blankets, and shelters across central logistics depots. Over-dispatch prevention guarantees reliable field aid.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={activeTab === 'stock' ? handleExportStockCSV : handleExportDispatchesCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSelectedItem(null);
                setIsInKindModalOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PackagePlus size={14} />
              <span>Receive In-Kind Stock</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSelectedItem(null);
                setIsDispatchModalOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={14} />
              <span>Dispatch Supplies</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSelectedItem(null);
                setIsAddModalOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={14} />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Low Stock Alerts Banner */}
        <LowStockAlerts
          onQuickRestock={item => {
            setSelectedItem(item);
            setIsInKindModalOpen(true);
          }}
        />

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: 'var(--space-6)' }}>
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
              <Boxes size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Items in Catalog
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                {state.inventory.length} Stock SKU Types
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(20, 184, 166, 0.12)',
                color: 'var(--color-teal-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Physical Stock Valuation
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-teal-600)' }}>
                {formatCurrency(totalValuation)} ({totalUnits.toLocaleString()} units)
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: lowStockCount > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: lowStockCount > 0 ? 'var(--color-warning)' : 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Safety Stock Status
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: lowStockCount > 0 ? 'var(--color-warning)' : 'var(--color-primary-600)' }}>
                {lowStockCount} Items Need Restocking
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Stock vs Dispatch Manifest */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'stock' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('stock')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Boxes size={15} />
            <span>Warehouse Stock Levels ({state.inventory.length})</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'dispatches' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('dispatches')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <History size={15} />
            <span>Field Dispatch Manifests ({state.dispatches.length})</span>
          </button>
        </div>

        {/* ACTIVE TAB: STOCK LEVELS */}
        {activeTab === 'stock' && (
          <>
            {/* Filter Toolbar */}
            <div
              className="glass-panel"
              style={{
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                alignItems: 'center',
              }}
            >
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
                  placeholder="Search item name, warehouse bay, or unit..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', margin: 0, fontSize: 'var(--text-xs)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: 'var(--text-xs)' }}
                >
                  <option value="all">All Categories</option>
                  <option value="food">Food &amp; Nutrition</option>
                  <option value="medical">Medical &amp; Surgical</option>
                  <option value="blankets">Blankets &amp; Thermal</option>
                  <option value="education">Education &amp; STEM</option>
                  <option value="shelter">Shelter &amp; Hardware</option>
                  <option value="hygiene">Water &amp; Hygiene</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: 'var(--text-xs)' }}
              >
                <option value="all">All Stock Statuses</option>
                <option value="in-stock">In Stock (Healthy)</option>
                <option value="low-stock">Low Stock Alerts</option>
                <option value="critical">Critical Depletion</option>
              </select>
            </div>

            {/* Inventory Table */}
            {filteredInventory.length === 0 ? (
              <EmptyState
                title="No inventory items match filter"
                description="Adjust your search keywords or category filters to view available warehouse items."
                actionText="Reset Filters"
                onAction={() => {
                  setSearch('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
              />
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Supply Item</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Stock Level</th>
                      <th>Warehouse Location</th>
                      <th style={{ textAlign: 'center' }}>Threshold</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Unit Value</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            ID: {item.id} • Restocked {formatDate(item.lastRestocked)}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 'var(--text-xs)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: 'var(--text-base)',
                              fontWeight: 800,
                              color: item.quantity <= item.lowStockThreshold ? 'var(--color-danger)' : 'var(--color-text-main)',
                            }}
                          >
                            {item.quantity.toLocaleString()}
                          </span>{' '}
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {item.unit}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>
                            {item.warehouseLocation}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {item.lowStockThreshold} {item.unit}
                        </td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(item.costPerUnit)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDispatchModalOpen(true);
                              }}
                              disabled={item.quantity === 0}
                              title="Dispatch to field mission"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              <Send size={13} />
                              <span>Dispatch</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsInKindModalOpen(true);
                              }}
                              title="Receive in-kind donation"
                              style={{ padding: '4px 6px' }}
                            >
                              <PackagePlus size={14} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsAddModalOpen(true);
                              }}
                              title="Edit item details"
                              style={{ padding: '4px 6px' }}
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              title="Delete item"
                              style={{ padding: '4px 6px', color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ACTIVE TAB: DISPATCH MANIFEST */}
        {activeTab === 'dispatches' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dispatch Ref</th>
                  <th>Date</th>
                  <th>Relief Item</th>
                  <th style={{ textAlign: 'right' }}>Dispatched Qty</th>
                  <th>Destination Camp / Sector</th>
                  <th>Convoy Assignee</th>
                  <th>Status</th>
                  <th>Operational Manifest</th>
                </tr>
              </thead>
              <tbody>
                {state.dispatches.map(d => (
                  <tr key={d.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                        {d.id}
                      </span>
                    </td>
                    <td>{formatDate(d.dispatchDate)}</td>
                    <td style={{ fontWeight: 600 }}>{d.itemName}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-teal-600)' }}>
                      {d.quantity} {d.unit}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.destinationCamp}</div>
                    </td>
                    <td>{d.volunteerAssigneeName}</td>
                    <td>
                      <Badge variant={d.status === 'delivered' ? 'success' : 'warning'}>
                        {d.status === 'delivered' ? (
                          <>
                            <CheckCircle size={12} />
                            <span>Delivered</span>
                          </>
                        ) : (
                          d.status
                        )}
                      </Badge>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: '240px' }}>
                      {d.notes || 'Direct community distribution'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedItem(null);
          }}
          itemToEdit={selectedItem}
        />

        <DispatchModal
          isOpen={isDispatchModalOpen}
          onClose={() => {
            setIsDispatchModalOpen(false);
            setSelectedItem(null);
          }}
          selectedItem={selectedItem}
        />

        <InKindModal
          isOpen={isInKindModalOpen}
          onClose={() => {
            setIsInKindModalOpen(false);
            setSelectedItem(null);
          }}
          selectedItem={selectedItem}
        />
      </div>
    </section>
  );
};
