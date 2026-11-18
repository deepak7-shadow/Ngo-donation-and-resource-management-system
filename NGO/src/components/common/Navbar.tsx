import React, { useState } from 'react';
import {
  HeartHandshake,
  Shield,
  UserCheck,
  Menu,
  X,
  Boxes,
  Users,
  PieChart,
  Layers,
  Heart,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenDonate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenDonate }) => {
  const { state, dispatch } = useNGO();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = state.role === 'admin';

  const navItems = [
    { id: 'impact', label: 'Impact Hub', icon: HeartHandshake },
    { id: 'campaigns', label: 'Campaigns', icon: Layers },
    { id: 'financial', label: 'Audit & Transparency', icon: PieChart },
    { id: 'inventory', label: 'Relief Inventory', icon: Boxes },
    { id: 'volunteers', label: 'Volunteers & Shifts', icon: Users },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Command', icon: Shield });
  }

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        backgroundColor: 'var(--glass-bg)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => handleNavClick('impact')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-teal-600) 0%, var(--color-primary-500) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
            }}
          >
            <HeartHandshake size={22} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-lg)',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Hope<span style={{ color: 'var(--color-primary-600)' }}>Sphere</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Humanitarian Trust &amp; Ledger
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav
          className="desktop-nav"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
        >
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="btn btn-ghost btn-sm"
                style={{
                  color: isActive ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  position: 'relative',
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.id === 'admin' && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-accent-500)',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Demo Role Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--color-bg-muted)',
              padding: '3px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
            }}
            title="Demo role switch: Toggle between Public/Donor view and Admin command center"
          >
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ROLE', payload: 'donor' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                backgroundColor: !isAdmin ? 'var(--color-bg-surface)' : 'transparent',
                color: !isAdmin ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                boxShadow: !isAdmin ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <UserCheck size={13} />
              <span className="hidden-sm">Donor</span>
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'SET_ROLE', payload: 'admin' });
                onTabChange('admin');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                backgroundColor: isAdmin ? 'var(--color-accent-500)' : 'transparent',
                color: isAdmin ? '#ffffff' : 'var(--color-text-muted)',
                boxShadow: isAdmin ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Shield size={13} />
              <span className="hidden-sm">Admin</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Donate Now Button */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenDonate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <Heart size={16} fill="currentColor" />
            <span>Donate</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-nav-toggle btn btn-ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{ padding: '0.4rem', color: 'var(--color-text-main)' }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-surface)',
            padding: 'var(--space-4) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="btn btn-ghost"
                style={{
                  justifyContent: 'flex-start',
                  width: '100%',
                  color: isActive ? 'var(--color-primary-600)' : 'var(--color-text-body)',
                  backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  padding: 'var(--space-3) var(--space-4)',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Media query styling for navbar */}
      <style>{`
        @media (min-width: 960px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav-toggle { display: none !important; }
          .mobile-menu { display: none !important; }
        }
        @media (max-width: 640px) {
          .hidden-sm { display: none; }
        }
      `}</style>
    </header>
  );
};
