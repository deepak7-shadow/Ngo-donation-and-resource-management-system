import React from 'react';
import {
  Heart,
  TrendingUp,
  ShieldCheck,
  Package,
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import { StatsCard } from '../common/StatsCard';

interface HeroBannerProps {
  onOpenDonate: () => void;
  onExploreCampaigns: () => void;
  onViewLedger: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenDonate,
  onExploreCampaigns,
  onViewLedger,
}) => {
  const { telemetry } = useNGO();

  return (
    <section
      style={{
        position: 'relative',
        padding: 'var(--space-12) 0 var(--space-8) 0',
        overflow: 'hidden',
      }}
    >
      {/* Background Subtle Gradient Blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(20, 184, 166, 0.05) 70%, transparent 100%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '2%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Trust Pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
          <div
            className="badge badge-success"
            style={{
              padding: '0.4rem 1rem',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Sparkles size={14} />
            <span>Open Humanitarian Ledger • 100% Verifiable Direct Aid • Section 80G Tax Deductible</span>
          </div>
        </div>

        {/* Hero Title & Pitch */}
        <div style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto var(--space-10) auto' }}>
          <h1
            style={{
              fontSize: 'var(--text-5xl)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 'var(--space-4)',
              lineHeight: 1.15,
            }}
          >
            Every Cent Audited.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-teal-600) 0%, var(--color-primary-600) 50%, var(--color-accent-500) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Every Life Impacted.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-muted)',
              maxWidth: '680px',
              margin: '0 auto var(--space-8) auto',
              lineHeight: 1.6,
            }}
          >
            HopeSphere bridges compassionate donors directly with frontline disaster response, clean water infrastructure, and child education through an open audit ledger with zero administrative waste.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-4)',
            }}
          >
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={onOpenDonate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Heart size={20} fill="currentColor" />
              <span>Make an Impact Today</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={onExploreCampaigns}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <span>Explore Missions</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-lg"
              onClick={onViewLedger}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: 'var(--color-text-muted)',
              }}
            >
              <ShieldCheck size={18} />
              <span>Inspect Audit Trail</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Counter Cards (Derived directly from Context State) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Funds Raised"
            value={telemetry.totalFundsRaised}
            prefix="$"
            icon={TrendingUp}
            color="emerald"
            subtitle="100% mapped to audited field invoices"
            trend="+18% this month"
          />

          <StatsCard
            label="Relief Kits Dispatched"
            value={telemetry.totalReliefDistributed}
            suffix=" units"
            icon={Package}
            color="amber"
            subtitle="Food rations, blankets, trauma kits"
            trend="Active delivery"
          />

          <StatsCard
            label="Active Field Volunteers"
            value={telemetry.activeVolunteersCount}
            icon={Users}
            color="teal"
            subtitle="Deployable across 6 emergency sectors"
            trend="Ready to mobilize"
          />

          <StatsCard
            label="Villages & Camps Reached"
            value={telemetry.villagesImpacted}
            icon={MapPin}
            color="blue"
            subtitle="Across high-altitude and flood plains"
            trend="Expanding"
          />
        </div>
      </div>
    </section>
  );
};
