import React, { useState } from 'react';
import { HeartHandshake, ShieldCheck, RefreshCw, Award, ArrowRight } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';

interface FooterProps {
  onTabChange: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  const { dispatch } = useNGO();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        title: 'Subscribed to Transparency Briefs',
        message: `Quarterly audit & relief updates will be delivered to ${email}.`,
        type: 'success',
      },
    });
    setEmail('');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default realistic seed state?')) {
      dispatch({ type: 'RESET_TO_SEED' });
    }
  };

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-bg-subtle)',
        borderTop: '1px solid var(--color-border)',
        marginTop: 'var(--space-16)',
        padding: 'var(--space-12) 0 var(--space-8) 0',
      }}
    >
      <div className="container">
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          style={{ marginBottom: 'var(--space-10)' }}
        >
          {/* Column 1: Organization Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--color-teal-600) 0%, var(--color-primary-500) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <HeartHandshake size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-lg)' }}>
                Hope<span style={{ color: 'var(--color-primary-600)' }}>Sphere</span>
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              A global humanitarian trust delivering life-saving relief, transparent aid accounting, and real-time verifiable disaster logistics.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-body)' }}>
                80G / 501(c)(3) Tax Exempt Verified
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Humanitarian Hubs
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              <li>
                <button type="button" onClick={() => onTabChange('impact')} className="btn-ghost" style={{ padding: 0 }}>
                  Live Impact Telemetry
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onTabChange('campaigns')} className="btn-ghost" style={{ padding: 0 }}>
                  Active Relief Campaigns
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onTabChange('financial')} className="btn-ghost" style={{ padding: 0 }}>
                  Verifiable Audit Ledger
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onTabChange('inventory')} className="btn-ghost" style={{ padding: 0 }}>
                  Stock &amp; Logistics Tracking
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onTabChange('volunteers')} className="btn-ghost" style={{ padding: 0 }}>
                  Volunteer Field Missions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Tax & Governance */}
          <div>
            <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Certifications &amp; Trust
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              <p>
                <strong>EIN Registration:</strong> 84-2948192
              </p>
              <p>
                <strong>Trust Order:</strong> HS/80G/9941/2021
              </p>
              <p>
                <strong>External Auditor:</strong> KPMG Statutory Review (FY 2025–2026 Cleared)
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary-600)', marginTop: '4px' }}>
                <Award size={16} />
                <span style={{ fontWeight: 600 }}>GuideStar Platinum Transparency Rating</span>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter & Reset Seed */}
          <div>
            <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Quarterly Impact Report
            </h5>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
              Subscribe for transparent financial dispatches and field mission logs.
            </p>
            {subscribed ? (
              <div
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-success-bg)',
                  border: '1px solid var(--color-success-border)',
                  color: 'var(--color-success)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                }}
              >
                ✓ You are subscribed to HopeSphere dispatches.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="email"
                  required
                  placeholder="donor@example.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: 'var(--text-xs)' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" aria-label="Subscribe to updates">
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            <div style={{ marginTop: 'var(--space-6)' }}>
              <button
                type="button"
                onClick={handleResetData}
                className="btn btn-ghost btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-text-subtle)',
                  fontSize: '0.75rem',
                  padding: 0,
                }}
                title="Reset localStorage state back to default seed data"
              >
                <RefreshCw size={13} />
                <span>Reset Demo Seed Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-6)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <p>© {new Date().getFullYear()} HopeSphere Foundation. 100% open-source humanitarian platform.</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <span>Zero-Fee Direct Aid Protocol</span>
            <span>•</span>
            <span>Encrypted Donor Privacy</span>
            <span>•</span>
            <span>Section 80G Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
