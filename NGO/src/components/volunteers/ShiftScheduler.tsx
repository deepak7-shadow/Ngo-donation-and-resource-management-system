import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  PlusCircle,
  Award,
  Filter,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { Shift, ShiftType } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { HoursTracker } from './HoursTracker';
import { Modal } from '../common/Modal';

export const ShiftScheduler: React.FC = () => {
  const { state, dispatch } = useNGO();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedShiftForHours, setSelectedShiftForHours] = useState<Shift | null>(null);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState<boolean>(false);

  // Sign up modal state
  const [signingUpShift, setSigningUpShift] = useState<Shift | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');

  // Add shift modal state
  const [isAddShiftOpen, setIsAddShiftOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<ShiftType>('field-mission');
  const [newLocation, setNewLocation] = useState<string>('Central Staging Yard');
  const [newDate, setNewDate] = useState<string>('2026-03-20');
  const [newStartTime, setNewStartTime] = useState<string>('09:00');
  const [newEndTime, setNewEndTime] = useState<string>('15:00');
  const [newHours, setNewHours] = useState<string>('6');
  const [newCapacity, setNewCapacity] = useState<string>('8');
  const [newCoordinator, setNewCoordinator] = useState<string>('Sarah Lin');
  const [newNotes, setNewNotes] = useState<string>('');

  const filteredShifts = useMemo(() => {
    return state.shifts.filter(shift => {
      if (typeFilter === 'all') return true;
      return shift.type === typeFilter;
    });
  }, [state.shifts, typeFilter]);

  const handleOpenSignup = (shift: Shift) => {
    setSigningUpShift(shift);
    if (state.volunteers.length > 0) {
      setSelectedVolunteerId(state.volunteers[0].id);
    }
  };

  const handleConfirmSignup = () => {
    if (!signingUpShift || !selectedVolunteerId) return;

    dispatch({
      type: 'SIGNUP_FOR_SHIFT',
      payload: {
        shiftId: signingUpShift.id,
        volunteerId: selectedVolunteerId,
      },
    });

    setSigningUpShift(null);
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim()) return;

    dispatch({
      type: 'ADD_SHIFT',
      payload: {
        title: newTitle.trim(),
        type: newType,
        location: newLocation.trim(),
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        hours: parseFloat(newHours) || 4,
        capacity: parseInt(newCapacity, 10) || 6,
        status: 'open',
        coordinatorName: newCoordinator.trim() || 'Coordinator',
        notes: newNotes.trim() || undefined,
      },
    });

    setIsAddShiftOpen(false);
    setNewTitle('');
    setNewNotes('');
  };

  const getTypeBadge = (type: ShiftType) => {
    switch (type) {
      case 'disaster-response':
        return <Badge variant="danger">Disaster Response</Badge>;
      case 'medical-camp':
        return <Badge variant="info">Medical Camp</Badge>;
      case 'food-drive':
        return <Badge variant="warning">Food Drive</Badge>;
      case 'tutoring':
        return <Badge variant="neutral">STEM Tutoring</Badge>;
      default:
        return <Badge variant="success">Field Mission</Badge>;
    }
  };

  return (
    <div>
      {/* Board Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: 'var(--text-xs)' }}
          >
            <option value="all">All Mission Types</option>
            <option value="disaster-response">Disaster Rapid Response</option>
            <option value="medical-camp">Medical Clinics</option>
            <option value="food-drive">Food Drives &amp; Packing</option>
            <option value="field-mission">Water &amp; Engineering Missions</option>
            <option value="tutoring">Child Tutoring &amp; STEM</option>
          </select>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddShiftOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={14} />
          <span>Post New Mission Shift</span>
        </button>
      </div>

      {/* Shifts Grid */}
      {filteredShifts.length === 0 ? (
        <EmptyState
          title="No relief missions found"
          description="There are currently no active field missions under this category."
          actionText="Show All Missions"
          onAction={() => setTypeFilter('all')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShifts.map(shift => {
            const isFull = shift.assignedVolunteerIds.length >= shift.capacity;
            const progress = (shift.assignedVolunteerIds.length / shift.capacity) * 100;

            return (
              <div
                key={shift.id}
                className="card glass-panel-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  borderLeft: isFull ? '4px solid var(--color-warning)' : '4px solid var(--color-primary-500)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {getTypeBadge(shift.type)}
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: isFull ? 'var(--color-warning)' : 'var(--color-success)',
                    }}
                  >
                    {isFull ? 'CAPACITY REACHED' : 'OPEN FOR ENROLLMENT'}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, lineHeight: 1.3 }}>
                    {shift.title}
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 'var(--space-3)',
                      marginTop: 'var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      <span>{formatDate(shift.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      <span>
                        {shift.startTime} – {shift.endTime} ({shift.hours}h)
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-subtle)',
                      marginTop: '4px',
                    }}
                  >
                    <MapPin size={13} />
                    <span>{shift.location}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 'var(--text-xs)',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)' }}>Crew Capacity</span>
                    <span style={{ fontWeight: 700 }}>
                      {shift.assignedVolunteerIds.length} / {shift.capacity} Filled
                    </span>
                  </div>
                  <ProgressBar
                    progress={progress}
                    variant={isFull ? 'urgent' : 'primary'}
                    size="sm"
                  />
                </div>

                {/* Assigned Volunteers Avatars */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 'var(--space-2)',
                    borderTop: '1px solid var(--color-border-subtle)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    Coord: <strong>{shift.coordinatorName}</strong>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={13} />
                    <span>{shift.assignedVolunteerIds.length} active</span>
                  </div>
                </div>

                {/* Actions: Sign Up or Log Hours */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={isFull}
                    onClick={() => handleOpenSignup(shift)}
                  >
                    {isFull ? 'Mission Full' : 'Sign Up'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedShiftForHours(shift);
                      setIsHoursModalOpen(true);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Award size={14} />
                    <span>Log Hours</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sign-up Modal */}
      {signingUpShift && (
        <Modal
          isOpen={!!signingUpShift}
          onClose={() => setSigningUpShift(null)}
          title={`Enroll in "${signingUpShift.title}"`}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Select a volunteer profile from the roster to register for this {signingUpShift.hours}-hour field mission.
            </p>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Volunteer Name</label>
              <select
                value={selectedVolunteerId}
                onChange={e => setSelectedVolunteerId(e.target.value)}
                className="form-select"
              >
                {state.volunteers.map(v => {
                  const isAssigned = signingUpShift.assignedVolunteerIds.includes(v.id);
                  return (
                    <option key={v.id} value={v.id} disabled={isAssigned}>
                      {v.name} ({v.location}) {isAssigned ? '— ALREADY REGISTERED' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSigningUpShift(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmSignup}
              >
                Confirm Enrollment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Shift Modal */}
      <Modal
        isOpen={isAddShiftOpen}
        onClose={() => setIsAddShiftOpen(false)}
        title="Schedule New Humanitarian Mission Shift"
        size="md"
      >
        <form onSubmit={handleCreateShift} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Mission Title *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="form-input"
              placeholder="e.g. Flood Relief Sandbagging & Pump Setup"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Mission Category *</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as ShiftType)}
                className="form-select"
              >
                <option value="field-mission">Water &amp; Engineering Field Mission</option>
                <option value="disaster-response">Disaster Rapid Response</option>
                <option value="food-drive">Food Drive &amp; Packing</option>
                <option value="medical-camp">Mobile Medical Camp</option>
                <option value="tutoring">Child Tutoring &amp; Education</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Location / Staging Area *</label>
              <input
                type="text"
                required
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                className="form-input"
                placeholder="e.g. Eastern Hill Dispensary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Date *</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                value={newStartTime}
                onChange={e => setNewStartTime(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">End Time *</label>
              <input
                type="time"
                value={newEndTime}
                onChange={e => setNewEndTime(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Credit Hours *</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={newHours}
                onChange={e => setNewHours(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Capacity Limit *</label>
              <input
                type="number"
                min="1"
                value={newCapacity}
                onChange={e => setNewCapacity(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Coordinator *</label>
              <input
                type="text"
                value={newCoordinator}
                onChange={e => setNewCoordinator(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Notes &amp; Equipment Needed</label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              className="form-textarea"
              placeholder="e.g. Steel-toed boots required, high-vis vests provided."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddShiftOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Post Mission
            </button>
          </div>
        </form>
      </Modal>

      {/* Hours Tracker Modal */}
      <HoursTracker
        isOpen={isHoursModalOpen}
        onClose={() => {
          setIsHoursModalOpen(false);
          setSelectedShiftForHours(null);
        }}
        shift={selectedShiftForHours}
      />
    </div>
  );
};
