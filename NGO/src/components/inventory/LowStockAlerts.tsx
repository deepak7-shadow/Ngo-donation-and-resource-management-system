import React from 'react';
import { AlertTriangle, PackagePlus } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { InventoryItem } from '../../types';

interface LowStockAlertsProps {
  onQuickRestock: (item: InventoryItem) => void;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ onQuickRestock }) => {
  const { state } = useNGO();

  const alertItems = state.inventory.filter(
    item => item.status === 'low-stock' || item.status === 'critical'
  );

  if (alertItems.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-warning-bg)',
        border: '1.5px solid var(--color-warning-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-6)',
        marginBottom: 'var(--space-6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0, color: 'var(--color-warning)' }}>
            Critical Stock Depletion Alerts ({alertItems.length} items below safety threshold)
          </h4>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          Safety Reserve Monitor
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {alertItems.map(item => {
          const isCritical = item.status === 'critical';
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid',
                borderColor: isCritical ? 'var(--color-danger-border)' : 'var(--color-warning-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: 'var(--color-text-main)',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                  </span>
                  {isCritical ? (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-danger-bg)',
                        color: 'var(--color-danger)',
                      }}
                    >
                      CRITICAL
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-warning-bg)',
                        color: 'var(--color-warning)',
                      }}
                    >
                      LOW
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Location: <strong>{item.warehouseLocation}</strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '4px',
                    marginTop: '4px',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 800,
                    color: isCritical ? 'var(--color-danger)' : 'var(--color-warning)',
                  }}
                >
                  <span>{item.quantity} {item.unit} remaining</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', fontWeight: 500 }}>
                    (Threshold: {item.lowStockThreshold})
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onQuickRestock(item)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                }}
              >
                <PackagePlus size={14} />
                <span>Receive In-Kind Stock</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
