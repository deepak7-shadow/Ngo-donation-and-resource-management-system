import React, { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { QuickActionBar } from './QuickActionBar';
import { MetricsOverview } from './MetricsOverview';
import { FundAllocationChart } from '../financial/FundAllocationChart';
import { ActivityLogViewer } from './ActivityLog';
import { DonationModal } from '../public/DonationModal';
import { DispatchModal } from '../inventory/DispatchModal';
import { ExpenseModal } from '../financial/ExpenseModal';
import { ShiftScheduler } from '../volunteers/ShiftScheduler';
import { Modal } from '../common/Modal';
import type { Donation } from '../../types';

interface AdminOverviewProps {
  onViewReceipt: (donation: Donation) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onViewReceipt }) => {
  // Modals state triggered via quick action bar
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  return (
    <section style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        {/* Admin Header & Security Notice */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div>
            <div
              className="badge badge-warning"
              style={{
                marginBottom: 'var(--space-2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Shield size={13} />
              <span>Executive Admin Command Mode</span>
            </div>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>
              Operations &amp; Fiduciary Governance Console
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Real-time administrative telemetry, disaster inventory dispatch, volunteer coordination, and statutory accounting audit tools.
            </p>
          </div>

          {/* Role Toggle Reminder Box */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              maxWidth: '380px',
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-body)' }}>
              <strong>Demo Role Switch Active:</strong> You are viewing privileged operational controls. Click <em>"Donor"</em> in the navigation bar to preview the public donor experience.
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        <QuickActionBar
          onOpenDonate={() => setIsDonateOpen(true)}
          onOpenDispatch={() => setIsDispatchOpen(true)}
          onOpenShift={() => setIsShiftModalOpen(true)}
          onOpenExpense={() => setIsExpenseOpen(true)}
        />

        {/* Analytics & Metrics Overview */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <MetricsOverview />
        </div>

        {/* Allocation Donut & Efficiency */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <FundAllocationChart />
        </div>

        {/* System Activity & Mutation Trail */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <ActivityLogViewer />
        </div>

        {/* Modals */}
        <DonationModal
          isOpen={isDonateOpen}
          onClose={() => setIsDonateOpen(false)}
          onViewReceipt={onViewReceipt}
        />

        <DispatchModal
          isOpen={isDispatchOpen}
          onClose={() => setIsDispatchOpen(false)}
        />

        <ExpenseModal
          isOpen={isExpenseOpen}
          onClose={() => setIsExpenseOpen(false)}
        />

        {/* Schedule Shift Modal Wrapper */}
        <Modal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          title="Relief Mission Operations"
          size="xl"
        >
          <ShiftScheduler />
        </Modal>
      </div>
    </section>
  );
};
