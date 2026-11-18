import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Clock } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { Shift, Volunteer } from '../../types';
import { Modal } from '../common/Modal';

interface HoursTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  shift?: Shift | null;
  volunteer?: Volunteer | null;
}

export const HoursTracker: React.FC<HoursTrackerProps> = ({
  isOpen,
  onClose,
  shift,
  volunteer,
}) => {
  const { state, dispatch } = useNGO();

  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [hours, setHours] = useState<string>('5');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (volunteer) {
      setSelectedVolunteerId(volunteer.id);
    } else if (state.volunteers.length > 0 && !selectedVolunteerId) {
      setSelectedVolunteerId(state.volunteers[0].id);
    }

    if (shift) {
      setSelectedShiftId(shift.id);
      setHours(shift.hours.toString());
    } else if (state.shifts.length > 0 && !selectedShiftId) {
      setSelectedShiftId(state.shifts[0].id);
      setHours(state.shifts[0].hours.toString());
    }
  }, [volunteer, shift, state.volunteers, state.shifts, isOpen]);

  const activeVol = state.volunteers.find(v => v.id === selectedVolunteerId);

  const parsedHours = parseFloat(hours) || 0;
  const currentTotal = activeVol ? activeVol.totalHours : 0;
  const projectedTotal = currentTotal + parsedHours;

  const getNextBadgePreview = (total: number) => {
    if (total < 10) return { name: 'Bronze Helper', hoursNeeded: 10 - total };
    if (total < 25) return { name: 'Silver Responder', hoursNeeded: 25 - total };
    if (total < 50) return { name: 'Gold Champion', hoursNeeded: 50 - total };
    if (total < 100) return { name: 'Platinum Luminary', hoursNeeded: 100 - total };
    return { name: 'Humanitarian Legend (Max Tier)', hoursNeeded: 0 };
  };

  const nextMilestone = getNextBadgePreview(projectedTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedHours <= 0) {
      setErrors({ hours: 'Hours must be greater than zero.' });
      return;
    }
    if (!selectedVolunteerId) {
      setErrors({ volunteer: 'Please select a volunteer.' });
      return;
    }

    dispatch({
      type: 'LOG_SHIFT_HOURS',
      payload: {
        shiftId: selectedShiftId || 'MANUAL',
        volunteerId: selectedVolunteerId,
        hours: parsedHours,
      },
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify &amp; Log Field Volunteer Hours" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Volunteer selection */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Volunteer *</label>
          <select
            value={selectedVolunteerId}
            onChange={e => setSelectedVolunteerId(e.target.value)}
            className="form-select"
          >
            {state.volunteers.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} (Current: {v.totalHours} hrs) - {v.location}
              </option>
            ))}
          </select>
        </div>

        {/* Shift selection */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Associated Relief Shift / Mission</label>
          <select
            value={selectedShiftId}
            onChange={e => {
              setSelectedShiftId(e.target.value);
              const found = state.shifts.find(s => s.id === e.target.value);
              if (found) setHours(found.hours.toString());
            }}
            className="form-select"
          >
            <option value="">General Field Duty (Non-scheduled)</option>
            {state.shifts.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.date} - {s.hours}h)
              </option>
            ))}
          </select>
        </div>

        {/* Hours input */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Service Hours to Credit *</label>
          <div style={{ position: 'relative' }}>
            <Clock
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
              type="number"
              min="0.5"
              step="0.5"
              max="24"
              value={hours}
              onChange={e => {
                setHours(e.target.value);
                setErrors({});
              }}
              className={`form-input ${errors.hours ? 'form-input-error' : ''}`}
              style={{ paddingLeft: '36px' }}
            />
          </div>
          {errors.hours && <span className="form-error-text">{errors.hours}</span>}
        </div>

        {/* Milestone Progression Preview Box */}
        {activeVol && (
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Current Record:
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>
                {activeVol.totalHours} Verified Hours
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                After Logging:
              </span>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                {projectedTotal} Total Hours
              </span>
            </div>

            <div
              style={{
                marginTop: 'var(--space-2)',
                paddingTop: 'var(--space-2)',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 'var(--text-xs)',
              }}
            >
              <Award size={16} style={{ color: 'var(--color-accent-500)', flexShrink: 0 }} />
              <div>
                <strong>Milestone Status:</strong>{' '}
                {nextMilestone.hoursNeeded > 0 ? (
                  <span>
                    {nextMilestone.hoursNeeded}h until <strong>{nextMilestone.name}</strong>
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                    {nextMilestone.name} Unlocked!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle size={16} />
            <span>Verify &amp; Credit Hours</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
