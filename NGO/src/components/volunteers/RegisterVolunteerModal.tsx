import React, { useState } from 'react';
import { UserPlus, Sparkles } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { AvailabilityType, VolunteerStatus } from '../../types';
import { Modal } from '../common/Modal';

interface RegisterVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterVolunteerModal: React.FC<RegisterVolunteerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { dispatch } = useNGO();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('Central Metro Hub');
  const [skillsInput, setSkillsInput] = useState<string>('First Aid, Logistics, Food Distribution');
  const [availability, setAvailability] = useState<AvailabilityType>('weekends');
  const status: VolunteerStatus = 'active';

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required.';
    if (!phone.trim()) errs.phone = 'Phone number is required for emergency dispatch.';
    if (!location.trim()) errs.location = 'Operational location is required.';
    if (!skillsInput.trim()) errs.skills = 'Please list at least one skill or capability.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    dispatch({
      type: 'REGISTER_VOLUNTEER',
      payload: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        skills,
        availability,
        status,
      },
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Onboard New Humanitarian Volunteer" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Full Volunteer Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
            placeholder="e.g. Sarah Lin"
          />
          {errors.name && <span className="form-error-text">{errors.name}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="sarah@fieldaid.org"
            />
            {errors.email && <span className="form-error-text">{errors.email}</span>}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
              placeholder="+1 (555) 781-9021"
            />
            {errors.phone && <span className="form-error-text">{errors.phone}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Primary Sector Location *</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className={`form-input ${errors.location ? 'form-input-error' : ''}`}
              placeholder="e.g. Central Metro Hub"
            />
            {errors.location && <span className="form-error-text">{errors.location}</span>}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Availability Schedule *</label>
            <select
              value={availability}
              onChange={e => setAvailability(e.target.value as AvailabilityType)}
              className="form-select"
            >
              <option value="weekends">Weekends Only</option>
              <option value="weekdays">Weekdays</option>
              <option value="flexible">Flexible / Anytime</option>
              <option value="emergency-only">Disaster Rapid Response Only</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Skills &amp; Capabilities (Comma separated) *</label>
          <input
            type="text"
            value={skillsInput}
            onChange={e => setSkillsInput(e.target.value)}
            className={`form-input ${errors.skills ? 'form-input-error' : ''}`}
            placeholder="First Aid, Medical Triage, Drone Pilot, Driving, Teaching"
          />
          {errors.skills && <span className="form-error-text">{errors.skills}</span>}
          <span className="form-help-text" style={{ marginTop: '2px' }}>
            Enter multiple skills separated by commas to match with field missions.
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--color-accent-500)', flexShrink: 0 }} />
          <span>
            Volunteers auto-earn Bronze (10h), Silver (25h), Gold (50h), and Platinum (100h) service medals as field hours are verified.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} />
            <span>Onboard Volunteer</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
