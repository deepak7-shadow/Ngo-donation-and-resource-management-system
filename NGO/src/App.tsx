import { useState, lazy, Suspense } from 'react';
import { NGOProvider } from './context/NGOContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';
import { HeroBanner } from './components/public/HeroBanner';
import { ImpactStats } from './components/public/ImpactStats';
import { CampaignList } from './components/public/CampaignList';
import type { Campaign, Donation } from './types';

// Lazy-loaded heavy views for optimal bundle splitting
const TransparencyLedger = lazy(() =>
  import('./components/financial/TransparencyLedger').then(m => ({ default: m.TransparencyLedger }))
);
const FundAllocationChart = lazy(() =>
  import('./components/financial/FundAllocationChart').then(m => ({ default: m.FundAllocationChart }))
);
const StockTable = lazy(() =>
  import('./components/inventory/StockTable').then(m => ({ default: m.StockTable }))
);
const VolunteerList = lazy(() =>
  import('./components/volunteers/VolunteerList').then(m => ({ default: m.VolunteerList }))
);
const AdminOverview = lazy(() =>
  import('./components/admin/AdminOverview').then(m => ({ default: m.AdminOverview }))
);
const DonationModal = lazy(() =>
  import('./components/public/DonationModal').then(m => ({ default: m.DonationModal }))
);
const ReceiptModal = lazy(() =>
  import('./components/public/ReceiptModal').then(m => ({ default: m.ReceiptModal }))
);

function ViewLoadingSkeleton() {
  return (
    <div className="container" style={{ padding: 'var(--space-12) var(--space-4)' }}>
      <div
        className="card skeleton"
        style={{
          height: '320px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Loading HopeSphere Module...
        </span>
      </div>
    </div>
  );
}

function MainContent() {
  const [activeTab, setActiveTab] = useState<string>('impact');

  // Modals state
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState<Campaign | null>(null);
  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<Donation | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const handleOpenDonateForCampaign = (campaign: Campaign) => {
    setSelectedCampaignForDonation(campaign);
    setIsDonateModalOpen(true);
  };

  const handleOpenGeneralDonate = () => {
    setSelectedCampaignForDonation(null);
    setIsDonateModalOpen(true);
  };

  const handleViewReceipt = (donation: Donation) => {
    setSelectedDonationForReceipt(donation);
    setIsReceiptModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar with role switch and navigation tabs */}
      <Navbar
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        onOpenDonate={handleOpenGeneralDonate}
      />

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        <Suspense fallback={<ViewLoadingSkeleton />}>
          {/* IMPACT HUB TAB */}
          {activeTab === 'impact' && (
            <>
              <HeroBanner
                onOpenDonate={handleOpenGeneralDonate}
                onExploreCampaigns={() => setActiveTab('campaigns')}
                onViewLedger={() => setActiveTab('financial')}
              />
              <ImpactStats onViewLedger={() => setActiveTab('financial')} />
              <div className="container" style={{ margin: 'var(--space-8) auto' }}>
                <FundAllocationChart />
              </div>
              <CampaignList onDonateToCampaign={handleOpenDonateForCampaign} />
            </>
          )}

          {/* CAMPAIGNS TAB */}
          {activeTab === 'campaigns' && (
            <CampaignList onDonateToCampaign={handleOpenDonateForCampaign} />
          )}

          {/* FINANCIAL TRANSPARENCY & AUDIT LEDGER */}
          {activeTab === 'financial' && (
            <>
              <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
                <FundAllocationChart />
              </div>
              <TransparencyLedger />
            </>
          )}

          {/* RESOURCE & RELIEF INVENTORY */}
          {activeTab === 'inventory' && <StockTable />}

          {/* VOLUNTEER WORKFORCE & SHIFTS */}
          {activeTab === 'volunteers' && <VolunteerList />}

          {/* ADMIN COMMAND CENTER */}
          {activeTab === 'admin' && (
            <AdminOverview onViewReceipt={handleViewReceipt} />
          )}
        </Suspense>
      </main>

      {/* Footer */}
      <Footer onTabChange={tab => setActiveTab(tab)} />

      {/* Global Modals */}
      <Suspense fallback={null}>
        {isDonateModalOpen && (
          <DonationModal
            isOpen={isDonateModalOpen}
            onClose={() => {
              setIsDonateModalOpen(false);
              setSelectedCampaignForDonation(null);
            }}
            selectedCampaign={selectedCampaignForDonation}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {isReceiptModalOpen && (
          <ReceiptModal
            isOpen={isReceiptModalOpen}
            onClose={() => {
              setIsReceiptModalOpen(false);
              setSelectedDonationForReceipt(null);
            }}
            donation={selectedDonationForReceipt}
          />
        )}
      </Suspense>

      {/* Floating Global Toasts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <NGOProvider>
      <MainContent />
    </NGOProvider>
  );
}
