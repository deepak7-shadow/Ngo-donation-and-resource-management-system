import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  CreditCard,
  QrCode,
  Building,
  ArrowRight,
  ArrowLeft,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useNGO } from '../../context/NGOContext';
import type { Campaign, Donation, PaymentMethod, DonationFrequency } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCampaign?: Campaign | null;
  onViewReceipt: (donation: Donation) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  selectedCampaign,
  onViewReceipt,
}) => {
  const { state, dispatch } = useNGO();

  // Multi-step state: 1: Amount, 2: Donor info, 3: Payment, 4: Success
  const [step, setStep] = useState<number>(1);

  // Form State
  const [frequency, setFrequency] = useState<DonationFrequency>('one-time');
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>('');
  
  // Donor details
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorTaxId, setDonorTaxId] = useState<string>('');
  const [anonymous, setAnonymous] = useState<boolean>(false);

  // Payment simulator details
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvv, setCardCvv] = useState<string>('742');
  const [upiId, setUpiId] = useState<string>('donor@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Completed donation placeholder for receipt view
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedCampaign) {
      setCampaignId(selectedCampaign.id);
    } else if (state.campaigns.length > 0 && !campaignId) {
      setCampaignId(state.campaigns[0].id);
    }
  }, [selectedCampaign, state.campaigns, campaignId]);

  // Reset form when opened fresh
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      setIsProcessing(false);
      setCompletedDonation(null);
    }
  }, [isOpen]);

  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  const getImpactDescription = (amt: number): string => {
    if (amt < 30) return 'Provides 5 essential family hygiene and dignity kits.';
    if (amt < 75) return 'Feeds a family of 4 with nutritious grain and lentil rations for a full month.';
    if (amt < 150) return 'Equips a child with an educational tablet, study stationeries, and solar study lamp.';
    if (amt < 350) return 'Funds clean water filtration and pipeline infrastructure for 50 remote villagers.';
    if (amt < 750) return 'Deploys an all-terrain mobile maternal healthcare clinic with diagnostic ultrasound for 1 week.';
    return 'Provides weather-proof emergency geodesic shelters and clean heat stoves for displaced families.';
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
      if (errors.amount) {
        setErrors(prev => ({ ...prev, amount: '' }));
      }
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!amount || amount < 5) {
      errs.amount = 'Minimum donation amount is $5.';
    }
    if (!campaignId) {
      errs.campaignId = 'Please select a campaign to support.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!anonymous && (!donorName || donorName.trim().length < 2)) {
      errs.donorName = 'Please enter your full legal name or choose anonymous.';
    }
    if (!donorEmail || !donorEmail.includes('@') || !donorEmail.includes('.')) {
      errs.donorEmail = 'A valid email is required to send your 80G tax receipt.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation & Submit
  const handleProcessPayment = () => {
    const errs: Record<string, string> = {};

    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.length < 12) {
        errs.card = 'Please enter a valid card number.';
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        errs.cardExpiry = 'Expiry date must be in MM/YY format.';
      }
      if (!cardCvv || cardCvv.length < 3) {
        errs.cardCvv = 'CVV must be 3 or 4 digits.';
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        errs.upi = 'Please enter a valid UPI Virtual Payment Address (e.g. name@upi).';
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsProcessing(true);

    // Simulate payment gateway delay (1.2s)
    setTimeout(() => {
      const activeCampaign = state.campaigns.find(c => c.id === campaignId);
      const campaignTitle = activeCampaign ? activeCampaign.title : 'General Humanitarian Fund';

      const donationPayload = {
        donorName: anonymous ? 'Anonymous Benefactor' : donorName,
        donorEmail,
        donorPhone: donorPhone || undefined,
        donorTaxId: donorTaxId || undefined,
        amount,
        currency: 'USD',
        frequency,
        campaignId,
        campaignName: campaignTitle,
        paymentMethod,
        anonymous,
      };

      dispatch({
        type: 'ADD_DONATION',
        payload: donationPayload,
      });

      // Construct dummy completed object for modal display & receipt preview
      const createdDonation: Donation = {
        ...donationPayload,
        id: 'DON-NEW',
        paymentStatus: 'completed',
        transactionRef: 'TXN-' + Math.floor(100000000 + Math.random() * 900000000),
        receiptNumber: `HS-80G-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString(),
      };

      setCompletedDonation(createdDonation);
      setIsProcessing(false);
      setStep(4);
    }, 1200);
  };

  const activeCampaignObj = state.campaigns.find(c => c.id === campaignId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 4 ? 'Donation Confirmed!' : 'Support HopeSphere Relief'}
      size={step === 4 ? 'lg' : 'md'}
    >
      {/* Step Indicators */}
      {step < 4 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-3)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step >= 1 ? 'var(--color-primary-600)' : 'var(--color-bg-muted)',
                color: step >= 1 ? '#ffffff' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
              }}
            >
              1
            </span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: step === 1 ? 700 : 500 }}>
              Amount
            </span>
          </div>
          <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-border)', margin: '0 8px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step >= 2 ? 'var(--color-primary-600)' : 'var(--color-bg-muted)',
                color: step >= 2 ? '#ffffff' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
              }}
            >
              2
            </span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: step === 2 ? 700 : 500 }}>
              Donor
            </span>
          </div>
          <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-border)', margin: '0 8px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step >= 3 ? 'var(--color-primary-600)' : 'var(--color-bg-muted)',
                color: step >= 3 ? '#ffffff' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
              }}
            >
              3
            </span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: step === 3 ? 700 : 500 }}>
              Payment
            </span>
          </div>
        </div>
      )}

      {/* STEP 1: AMOUNT & CAMPAIGN */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Target Campaign Selector */}
          <div className="form-group">
            <label className="form-label">Supporting Campaign</label>
            <select
              value={campaignId}
              onChange={e => setCampaignId(e.target.value)}
              className="form-select"
            >
              {state.campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Frequency Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              border: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setFrequency('one-time')}
              style={{
                flex: 1,
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                backgroundColor: frequency === 'one-time' ? 'var(--color-bg-surface)' : 'transparent',
                color: frequency === 'one-time' ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
                boxShadow: frequency === 'one-time' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              One-Time Gift
            </button>
            <button
              type="button"
              onClick={() => setFrequency('monthly')}
              style={{
                flex: 1,
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                backgroundColor: frequency === 'monthly' ? 'var(--color-primary-600)' : 'transparent',
                color: frequency === 'monthly' ? '#ffffff' : 'var(--color-text-muted)',
                boxShadow: frequency === 'monthly' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Monthly Sustainer (3x Impact)
            </button>
          </div>

          {/* Preset Buttons Grid */}
          <div>
            <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>
              Select Contribution Amount (USD)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAmountSelect(val)}
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid',
                    borderColor: amount === val && !customAmount ? 'var(--color-primary-600)' : 'var(--color-border)',
                    backgroundColor: amount === val && !customAmount ? 'var(--color-primary-50)' : 'var(--color-bg-surface)',
                    color: amount === val && !customAmount ? 'var(--color-primary-700)' : 'var(--color-text-main)',
                    fontWeight: 700,
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Field */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Or Custom Amount</label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                }}
              >
                $
              </span>
              <input
                type="text"
                placeholder="Enter custom USD"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="form-input"
                style={{ paddingLeft: '28px' }}
              />
            </div>
            {errors.amount && <span className="form-error-text">{errors.amount}</span>}
          </div>

          {/* Dynamic Impact Statement Card */}
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-success-border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
            }}
          >
            <Sparkles size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-success)' }}>
                Your {formatCurrency(amount)} Impact:
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-body)', marginTop: '2px' }}>
                {getImpactDescription(amount)}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (validateStep1()) setStep(2);
            }}
            style={{ marginTop: 'var(--space-2)' }}
          >
            <span>Continue to Donor Details</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* STEP 2: DONOR DETAILS & TAX EXEMPTION */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Anonymous toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-2)',
            }}
          >
            <input
              type="checkbox"
              checked={anonymous}
              onChange={e => setAnonymous(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span style={{ fontWeight: 600 }}>Make this an anonymous donation</span>
          </label>

          {!anonymous && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Legal Name *</label>
              <input
                type="text"
                placeholder="Eleanor Vance"
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                className={`form-input ${errors.donorName ? 'form-input-error' : ''}`}
              />
              {errors.donorName && <span className="form-error-text">{errors.donorName}</span>}
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address (for 80G Tax Receipt) *</label>
            <input
              type="email"
              placeholder="eleanor@vancefamily.org"
              value={donorEmail}
              onChange={e => setDonorEmail(e.target.value)}
              className={`form-input ${errors.donorEmail ? 'form-input-error' : ''}`}
            />
            {errors.donorEmail && <span className="form-error-text">{errors.donorEmail}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone (Optional)</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={donorPhone}
                onChange={e => setDonorPhone(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">PAN / Tax ID (Optional for 80G)</label>
              <input
                type="text"
                placeholder="ABCDE1234F"
                value={donorTaxId}
                onChange={e => setDonorTaxId(e.target.value.toUpperCase())}
                className="form-input"
              />
            </div>
          </div>

          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-subtle)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            🔒 HopeSphere encrypts your contact information. Providing your PAN or Tax ID allows you to claim 100% tax deduction under Section 80G / 501(c)(3).
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (validateStep2()) setStep(3);
              }}
              style={{ flex: 2 }}
            >
              <span>Proceed to Payment</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT SIMULATOR */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Order Summary Pill */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Donating to: <strong>{activeCampaignObj?.title || 'Relief Fund'}</strong>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                {frequency === 'monthly' ? 'Monthly Sustaining Gift' : 'One-Time Direct Aid'}
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {formatCurrency(amount)}
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
            }}
          >
            {[
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'upi', label: 'UPI / QR', icon: QrCode },
              { id: 'netbanking', label: 'NetBank', icon: Building },
              { id: 'wire', label: 'Wire', icon: FileText },
            ].map(m => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary-600)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--color-bg-surface)',
                    color: isSelected ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                  }}
                >
                  <Icon size={16} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Card Simulator */}
          {paymentMethod === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="form-input"
                  placeholder="4532 •••• •••• 8821"
                />
                {errors.card && <span className="form-error-text">{errors.card}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="form-input"
                    placeholder="12/28"
                  />
                  {errors.cardExpiry && <span className="form-error-text">{errors.cardExpiry}</span>}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">CVV / CVC</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="form-input"
                    placeholder="•••"
                  />
                  {errors.cardCvv && <span className="form-error-text">{errors.cardCvv}</span>}
                </div>
              </div>
            </div>
          )}

          {/* UPI Simulator */}
          {paymentMethod === 'upi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', textAlign: 'center' }}>
              <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                <label className="form-label">Enter VPA / UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="form-input"
                  placeholder="yourname@okhdfcbank"
                />
                {errors.upi && <span className="form-error-text">{errors.upi}</span>}
              </div>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>- OR SCAN INSTANT QR -</div>

              <div
                style={{
                  margin: '0 auto',
                  padding: 'var(--space-4)',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'inline-block',
                }}
              >
                <QrCode size={120} style={{ color: '#0f172a' }} />
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                  BHIM / GooglePay / PhonePe Sim
                </div>
              </div>
            </div>
          )}

          {/* NetBanking Simulator */}
          {paymentMethod === 'netbanking' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Select Your Banking Partner</label>
              <select
                value={selectedBank}
                onChange={e => setSelectedBank(e.target.value)}
                className="form-select"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="JPMorgan Chase">JPMorgan Chase</option>
                <option value="Bank of America">Bank of America</option>
                <option value="Barclays UK">Barclays UK</option>
                <option value="Standard Chartered">Standard Chartered</option>
              </select>
            </div>
          )}

          {/* Wire Transfer Simulator */}
          {paymentMethod === 'wire' && (
            <div
              style={{
                backgroundColor: 'var(--color-bg-subtle)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-body)',
                lineHeight: 1.6,
              }}
            >
              <div><strong>Beneficiary:</strong> HopeSphere Humanitarian Trust Inc.</div>
              <div><strong>Bank:</strong> Global Philanthropy Reserve NY</div>
              <div><strong>SWIFT / BIC:</strong> HPSHUS33XXX</div>
              <div><strong>Routing / ABA:</strong> 021000021</div>
              <div><strong>Reference Memo:</strong> HS-DON-{Math.floor(1000 + Math.random() * 9000)}</div>
            </div>
          )}

          {/* Payment CTA */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(2)}
              disabled={isProcessing}
              style={{ flex: 1 }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleProcessPayment}
              disabled={isProcessing}
              style={{ flex: 2 }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Authorize {formatCurrency(amount)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION & 80G RECEIPT */}
      {step === 4 && completedDonation && (
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4) auto',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle size={36} />
          </div>

          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            Thank You, {anonymous ? 'Generous Benefactor' : donorName}!
          </h3>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto var(--space-6) auto' }}>
            Your gift of <strong>{formatCurrency(amount)}</strong> has been allocated to <strong>{completedDonation.campaignName}</strong>. The transparency ledger and campaign milestones have updated in real time.
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'left',
              marginBottom: 'var(--space-6)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-3)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Receipt Number:</span>
              <div style={{ fontWeight: 700, color: 'var(--color-primary-600)' }}>
                {completedDonation.receiptNumber}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Transaction Reference:</span>
              <div style={{ fontWeight: 700 }}>{completedDonation.transactionRef}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Tax Exemption:</span>
              <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                Section 80G / 501(c)(3) Eligible
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
              <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>Completed &amp; Cleared</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onViewReceipt(completedDonation);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <FileText size={16} />
              <span>View &amp; Print 80G Tax Receipt</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
