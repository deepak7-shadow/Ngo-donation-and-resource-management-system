import React, { useState } from 'react';
import {
  Heart,
  Send,
  PlusCircle,
  Calendar,
  AlertOctagon,
  Boxes,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import { Modal } from '../common/Modal';

interface QuickActionBarProps {
  onOpenDonate: () => void;
  onOpenDispatch: () => void;
  onOpenShift: () => void;
  onOpenExpense: () => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onOpenDonate,
  onOpenDispatch,
  onOpenShift,
  onOpenExpense,
}) => {
  const { dispatch } = useNGO();
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // New Campaign Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'water' | 'relief' | 'education' | 'health' | 'food' | 'shelter'>('relief');
  const [goalAmount, setGoalAmount] = useState('75000');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Flood Delta Zone');
  const [beneficiaryCount, setBeneficiaryCount] = useState('8500');

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    dispatch({
      type: 'ADD_CAMPAIGN',
      payload: {
        title: title.trim(),
        category,
        description: description.trim(),
        goalAmount: parseFloat(goalAmount) || 50000,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2026-10-30',
        urgency: 'critical',
        featured: true,
        beneficiaryCount: parseInt(beneficiaryCount, 10) || 5000,
        location: location.trim(),
        image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1000&q=80',
        status: 'urgent',
      },
    });

    setIsCampaignModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: 'var(--space-4) var(--space-6)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        borderLeft: '4px solid var(--color-accent-500)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertOctagon size={18} style={{ color: 'var(--color-accent-500)' }} />
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>
            Incident Commander Quick Action Bar
          </h4>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
          Execute rapid emergency operations with instant state dispatch.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenDonate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Heart size={14} />
          <span>Log Emergency Donation</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenDispatch}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Send size={14} />
          <span>Dispatch Relief Stock</span>
        </button>

        <button
          type="button"
          className="btn btn-accent btn-sm"
          onClick={() => setIsCampaignModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={14} />
          <span>Post Urgent Campaign</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenShift}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Calendar size={14} />
          <span>Dispatch Volunteers</span>
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onOpenExpense}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Boxes size={14} />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Post Urgent Campaign Modal */}
      <Modal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        title="Launch Urgent Relief Campaign"
        size="md"
      >
        <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Campaign Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              placeholder="e.g. Flash Flood Emergency Rescue & Drinking Water"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as 'water' | 'relief' | 'education' | 'health' | 'food' | 'shelter')}
                className="form-select"
              >
                <option value="relief">Emergency Relief</option>
                <option value="water">Clean Water</option>
                <option value="food">Food Rations</option>
                <option value="health">Mobile Health</option>
                <option value="shelter">Shelter &amp; Tents</option>
                <option value="education">Education</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Funding Goal ($) *</label>
              <input
                type="number"
                min="1000"
                required
                value={goalAmount}
                onChange={e => setGoalAmount(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Est. Beneficiaries *</label>
              <input
                type="number"
                min="100"
                value={beneficiaryCount}
                onChange={e => setBeneficiaryCount(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Mission Brief &amp; Call to Action *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="Describe emergency conditions, supplies needed, and distribution strategy..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCampaignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent">
              Publish Urgent Campaign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
