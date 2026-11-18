import React from 'react';
import { ShieldCheck, Heart, Award, ArrowUpRight } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface ImpactStatsProps {
  onViewLedger: () => void;
}

export const ImpactStats: React.FC<ImpactStatsProps> = ({ onViewLedger }) => {
  const { telemetry } = useNGO();

  return (
    <section style={{ padding: 'var(--space-8) 0' }}>
      <div className="container">
        <div
          className="glass-panel"
          style={{
            padding: 'var(--space-8)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-8)',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: 'var(--space-6)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--color-primary-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Audited Efficiency &amp; Fund Governance
              </span>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginTop: 'var(--space-1)' }}>
                How Your Contribution Directly Transforms Lives
              </h2>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onViewLedger}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <span>Examine Ledger Invoices</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          {/* 3 Pillars of Fund Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="card"
              style={{
                backgroundColor: 'var(--color-success-bg)',
                borderColor: 'var(--color-success-border)',
                borderWidth: '1.5px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-success)' }}>
                  {telemetry.directAidPercentage}%
                </span>
                <Heart size={24} style={{ color: 'var(--color-success)' }} />
              </div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                Direct Humanitarian Aid
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Borewells, emergency rations, mobile surgical kits, warm shelters, and student tablets delivered straight to beneficiaries.
              </p>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-teal-600)' }}>
                  {telemetry.logisticsPercentage}%
                </span>
                <ShieldCheck size={24} style={{ color: 'var(--color-teal-600)' }} />
              </div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                Last-Mile Logistics &amp; Transport
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                4x4 convoy fuels, cold-chain solar vaccine freezers, river ferries, and warehouse storage safeguarding emergency stock.
              </p>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                  {telemetry.adminPercentage}%
                </span>
                <Award size={24} style={{ color: 'var(--color-accent-500)' }} />
              </div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                Governance &amp; Statutory Audits
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                External statutory filings, data encryption, compliance with 80G tax authorities, and legal transparency mandates.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              marginTop: 'var(--space-8)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-around',
              alignItems: 'center',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-6)',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Beneficiaries Reached
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {formatNumber(telemetry.totalBeneficiaries)} individuals
              </div>
            </div>

            <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--color-border)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Transparency Ledger
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                {formatCurrency(telemetry.totalFundsRaised)}
              </div>
            </div>

            <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--color-border)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Donor Tax Exemption
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-accent-600)' }}>
                100% 80G Deductible
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
