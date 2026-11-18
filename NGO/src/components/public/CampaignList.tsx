import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Users,
  Clock,
  Heart,
  Droplets,
  Flame,
  GraduationCap,
  Activity,
  Wheat,
  Home,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { Campaign, CampaignCategory, UrgencyLevel } from '../../types';
import { formatCurrency, calculateProgress } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';

interface CampaignListProps {
  onDonateToCampaign: (campaign: Campaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ onDonateToCampaign }) => {
  const { state } = useNGO();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'progress' | 'goal'>('urgency');

  const categories: { id: string; label: string; icon: React.FC<{ size?: number }> }[] = [
    { id: 'all', label: 'All Missions', icon: () => null },
    { id: 'water', label: 'Clean Water', icon: Droplets },
    { id: 'relief', label: 'Winter Relief', icon: Flame },
    { id: 'education', label: 'Child Education', icon: GraduationCap },
    { id: 'health', label: 'Mobile Health', icon: Activity },
    { id: 'food', label: 'Food Rations', icon: Wheat },
    { id: 'shelter', label: 'Shelter & Homes', icon: Home },
  ];

  const filteredCampaigns = useMemo(() => {
    return state.campaigns
      .filter(campaign => {
        const matchesSearch =
          campaign.title.toLowerCase().includes(search.toLowerCase()) ||
          campaign.description.toLowerCase().includes(search.toLowerCase()) ||
          campaign.location.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' || campaign.category === (selectedCategory as CampaignCategory);

        const matchesUrgency =
          selectedUrgency === 'all' || campaign.urgency === (selectedUrgency as UrgencyLevel);

        return matchesSearch && matchesCategory && matchesUrgency;
      })
      .sort((a, b) => {
        if (sortBy === 'progress') {
          const progA = a.raisedAmount / a.goalAmount;
          const progB = b.raisedAmount / b.goalAmount;
          return progB - progA;
        }
        if (sortBy === 'goal') {
          return b.goalAmount - a.goalAmount;
        }
        // Urgency sorting
        const urgencyWeight: Record<UrgencyLevel, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
      });
  }, [state.campaigns, search, selectedCategory, selectedUrgency, sortBy]);

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'critical':
        return <Badge variant="danger">Critical Need</Badge>;
      case 'high':
        return <Badge variant="warning">High Urgency</Badge>;
      default:
        return <Badge variant="info">Ongoing Mission</Badge>;
    }
  };

  const calculateDaysLeft = (endDate: string): number => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <section id="campaigns-section" style={{ padding: 'var(--space-12) 0' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-8) auto' }}>
          <div className="badge badge-success" style={{ marginBottom: 'var(--space-2)' }}>
            Active Verified Relief Campaigns
          </div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
            Choose Where Your Compassion Makes History
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            Direct your gift to emergency field initiatives. Transparent line-by-line expenditure tracking guarantees every dollar reaches vulnerable communities.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div
          className="glass-panel"
          style={{
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {/* Top row: search + sort + urgency */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search
                size={18}
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
                placeholder="Search by mission, location, or relief type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', margin: 0 }}
              />
            </div>

            {/* Urgency Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
              <select
                value={selectedUrgency}
                onChange={e => setSelectedUrgency(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: 'var(--text-xs)' }}
              >
                <option value="all">All Urgency Tiers</option>
                <option value="critical">Critical Priority Only</option>
                <option value="high">High Urgency</option>
                <option value="medium">Medium Urgency</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'urgency' | 'progress' | 'goal')}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: 'var(--text-xs)' }}
              >
                <option value="urgency">Most Urgent First</option>
                <option value="progress">Closest to Goal</option>
                <option value="goal">Largest Funding Target</option>
              </select>
            </div>
          </div>

          {/* Category Pills Row */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              overflowX: 'auto',
              paddingBottom: 'var(--space-1)',
            }}
          >
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: 'var(--radius-full)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campaign Cards Grid */}
        {filteredCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns match your filters"
            description="Try modifying your search keywords or resetting the category filter to view all active relief missions."
            actionText="Reset All Filters"
            onAction={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedUrgency('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map(campaign => {
              const progress = calculateProgress(campaign.raisedAmount, campaign.goalAmount);
              const daysLeft = calculateDaysLeft(campaign.endDate);
              const isCritical = campaign.urgency === 'critical';

              return (
                <div
                  key={campaign.id}
                  className="card glass-panel-hover"
                  style={{
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Campaign Image Cover */}
                  <div
                    style={{
                      height: '200px',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-bg-muted)',
                    }}
                  >
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform var(--transition-slow)',
                      }}
                      onError={e => {
                        // Fallback to local vector illustration if remote image is unreachable
                        const target = e.currentTarget;
                        target.src = `/src/assets/${campaign.category === 'water' ? 'clean-water' : campaign.category === 'relief' ? 'winter-relief' : campaign.category === 'education' ? 'education' : campaign.category === 'health' ? 'mobile-health' : campaign.category === 'food' ? 'malnutrition' : 'shelter'}.svg`;
                      }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'scale(1.0)')}
                    />

                    {/* Gradient Overlay for badges */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 50%, rgba(0,0,0,0.7) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: 'var(--space-3)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {getUrgencyBadge(campaign.urgency)}
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'rgba(0,0,0,0.65)',
                            color: '#ffffff',
                            backdropFilter: 'blur(4px)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {campaign.category}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: '#ffffff', fontSize: 'var(--text-xs)' }}>
                        <MapPin size={13} style={{ color: 'var(--color-accent-400)' }} />
                        <span style={{ fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                          {campaign.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Body */}
                  <div
                    style={{
                      padding: 'var(--space-5)',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      gap: 'var(--space-3)',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: 'var(--space-2)',
                        }}
                      >
                        {campaign.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {campaign.description}
                      </p>
                    </div>

                    {/* Progress Bar & Financials */}
                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: 'var(--space-2)',
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: 'var(--text-base)',
                              fontWeight: 800,
                              color: 'var(--color-primary-600)',
                            }}
                          >
                            {formatCurrency(campaign.raisedAmount)}
                          </span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
                            {' '}
                            raised of {formatCurrency(campaign.goalAmount)}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700,
                            color: isCritical ? 'var(--color-danger)' : 'var(--color-text-main)',
                          }}
                        >
                          {progress}%
                        </span>
                      </div>

                      <ProgressBar
                        progress={progress}
                        variant={isCritical ? 'urgent' : 'primary'}
                        size="md"
                      />

                      {/* Footer Telemetry (Donors + Days Left) */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 'var(--space-3)',
                          paddingTop: 'var(--space-2)',
                          borderTop: '1px solid var(--color-border-subtle)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={13} />
                          <span>{campaign.donorsCount} Donors</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} />
                          <span>{daysLeft} days left</span>
                        </div>
                      </div>
                    </div>

                    {/* Donate Action Button */}
                    <button
                      type="button"
                      className={`btn ${isCritical ? 'btn-accent' : 'btn-primary'}`}
                      style={{ width: '100%', marginTop: 'var(--space-2)' }}
                      onClick={() => onDonateToCampaign(campaign)}
                    >
                      <Heart size={16} fill="currentColor" />
                      <span>Support This Mission</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
