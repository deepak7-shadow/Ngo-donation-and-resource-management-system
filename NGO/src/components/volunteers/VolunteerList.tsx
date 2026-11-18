import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Award,
  Clock,
  MapPin,
  Calendar,
  Download,
  Users,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { Volunteer, AvailabilityType } from '../../types';
import { exportToCSV } from '../../utils/exportHelpers';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { ShiftScheduler } from './ShiftScheduler';
import { RegisterVolunteerModal } from './RegisterVolunteerModal';
import { HoursTracker } from './HoursTracker';

export const VolunteerList: React.FC = () => {
  const { state } = useNGO();

  const [activeTab, setActiveTab] = useState<'roster' | 'shifts'>('roster');
  const [search, setSearch] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [minHoursFilter, setMinHoursFilter] = useState<string>('0');

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState<boolean>(false);
  const [selectedVolunteerForHours, setSelectedVolunteerForHours] = useState<Volunteer | null>(null);

  const filteredVolunteers = useMemo(() => {
    return state.volunteers.filter(vol => {
      const q = search.toLowerCase();
      const matchesSearch =
        vol.name.toLowerCase().includes(q) ||
        vol.location.toLowerCase().includes(q) ||
        vol.skills.some(s => s.toLowerCase().includes(q));

      const matchesAvailability =
        availabilityFilter === 'all' || vol.availability === (availabilityFilter as AvailabilityType);

      const matchesHours = vol.totalHours >= parseInt(minHoursFilter, 10);

      return matchesSearch && matchesAvailability && matchesHours;
    });
  }, [state.volunteers, search, availabilityFilter, minHoursFilter]);

  const handleExportCSV = () => {
    const rows = filteredVolunteers.map(v => ({
      'Volunteer ID': v.id,
      'Name': v.name,
      'Email': v.email,
      'Phone': v.phone,
      'Location': v.location,
      'Availability': v.availability,
      'Total Verified Hours': v.totalHours,
      'Badges Earned': v.badges.join('; '),
      'Skills': v.skills.join(', '),
      'Status': v.status,
      'Joined Date': v.joinedDate,
    }));
    exportToCSV('HopeSphere_Volunteer_Directory', rows);
  };

  const getBadgeIconColor = (badgeName: string) => {
    if (badgeName.includes('Platinum')) return '#0d9488'; // teal
    if (badgeName.includes('Gold')) return '#f59e0b'; // amber
    if (badgeName.includes('Silver')) return '#94a3b8'; // silver
    return '#b45309'; // bronze
  };

  const totalHoursLogged = state.volunteers.reduce((acc, v) => acc + v.totalHours, 0);

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
              Humanitarian Field Workforce
            </div>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>
              Volunteer Directory &amp; Mission Shifts
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '640px' }}>
              Coordinating frontline doctors, engineers, drivers, and teachers. Real-time hour logging and automated milestone awards recognize selfless service.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export Roster CSV</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsRegisterModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={14} />
              <span>Register New Volunteer</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stats Cards */}
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
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Active Volunteer Corps
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                {state.volunteers.length} Ready Responders
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--color-accent-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Service Hours Logged
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-accent-600)' }}>
                {totalHoursLogged.toLocaleString()} Field Hours
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(13, 148, 136, 0.12)',
                color: 'var(--color-teal-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Scheduled Missions
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                {state.shifts.length} Relief Shifts
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'roster' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('roster')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={15} />
            <span>Volunteer Directory ({state.volunteers.length})</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'shifts' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('shifts')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Calendar size={15} />
            <span>Shift Scheduler Board ({state.shifts.length})</span>
          </button>
        </div>

        {/* ACTIVE TAB: VOLUNTEER DIRECTORY */}
        {activeTab === 'roster' && (
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
                  placeholder="Search by volunteer name, location, or skill..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', margin: 0, fontSize: 'var(--text-xs)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
                <select
                  value={availabilityFilter}
                  onChange={e => setAvailabilityFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: 'var(--text-xs)' }}
                >
                  <option value="all">All Availability Schedules</option>
                  <option value="weekends">Weekends Only</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="flexible">Flexible / Anytime</option>
                  <option value="emergency-only">Emergency Response Only</option>
                </select>
              </div>

              <select
                value={minHoursFilter}
                onChange={e => setMinHoursFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: 'var(--text-xs)' }}
              >
                <option value="0">All Hours</option>
                <option value="10">Bronze (10+ hours)</option>
                <option value="25">Silver (25+ hours)</option>
                <option value="50">Gold (50+ hours)</option>
                <option value="100">Platinum (100+ hours)</option>
              </select>
            </div>

            {/* Volunteer Cards Grid */}
            {filteredVolunteers.length === 0 ? (
              <EmptyState
                title="No volunteers found"
                description="Try broadening your search keywords or clearing availability filters."
                actionText="Reset Filters"
                onAction={() => {
                  setSearch('');
                  setAvailabilityFilter('all');
                  setMinHoursFilter('0');
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVolunteers.map(vol => (
                  <div
                    key={vol.id}
                    className="card glass-panel-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-full)',
                            background: 'linear-gradient(135deg, var(--color-teal-600) 0%, var(--color-primary-600) 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 'var(--text-base)',
                          }}
                        >
                          {vol.name.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
                            {vol.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <MapPin size={12} />
                            <span>{vol.location}</span>
                          </div>
                        </div>
                      </div>

                      <Badge variant={vol.status === 'deployed' ? 'warning' : 'success'}>
                        {vol.status === 'deployed' ? 'Deployed' : 'Active'}
                      </Badge>
                    </div>

                    {/* Verified Hours Bar */}
                    <div
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} style={{ color: 'var(--color-accent-500)' }} />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          Logged Service:
                        </span>
                      </div>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-main)' }}>
                        {vol.totalHours} hrs
                      </span>
                    </div>

                    {/* Achievement Badges Pills */}
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Honors &amp; Badges Earned:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {vol.badges.length > 0 ? (
                          vol.badges.map(b => (
                            <span
                              key={b}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--color-bg-muted)',
                                color: getBadgeIconColor(b),
                                border: '1px solid var(--color-border)',
                              }}
                            >
                              <Award size={12} />
                              <span>{b}</span>
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>
                            Beginner ({10 - vol.totalHours}h to Bronze Helper)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skills Tags */}
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Verified Skills:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {vol.skills.map(s => (
                          <span
                            key={s}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--color-bg-subtle)',
                              color: 'var(--color-text-muted)',
                              border: '1px solid var(--color-border-subtle)',
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: 'var(--space-3)',
                        borderTop: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        Sched: <strong>{vol.availability}</strong>
                      </span>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedVolunteerForHours(vol);
                          setIsHoursModalOpen(true);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                      >
                        <Clock size={13} />
                        <span>Log Hours</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ACTIVE TAB: SHIFT SCHEDULER */}
        {activeTab === 'shifts' && <ShiftScheduler />}

        {/* Modals */}
        <RegisterVolunteerModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
        />

        <HoursTracker
          isOpen={isHoursModalOpen}
          onClose={() => {
            setIsHoursModalOpen(false);
            setSelectedVolunteerForHours(null);
          }}
          volunteer={selectedVolunteerForHours}
        />
      </div>
    </section>
  );
};
