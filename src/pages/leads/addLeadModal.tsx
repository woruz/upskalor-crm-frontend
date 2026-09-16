import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import type { LeadItem, LeadStatus } from './leads';
import styles from './addLeadModal.module.scss';

// ─── Form state ───────────────────────────────────────────────────────────────

interface LeadFormState {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  billAmount: string;
  followUp: string;
  state: string;
  city: string;
  roofOwnership: string;
  roofType: string;
  source: string;
  executive: string;
}

const EMPTY_FORM: LeadFormState = {
  customerName: '',
  phone: '',
  email: '',
  address: '',
  billAmount: '',
  followUp: '',
  state: '',
  city: '',
  roofOwnership: '',
  roofType: '',
  source: '',
  executive: '',
};

// ─── Dropdown options ─────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const ROOF_OWNERSHIP = ['Own', 'Rented', 'Leased'];
const ROOF_TYPES = ['Flat (RCC)', 'Sloped / Tiled', 'Metal / Tin', 'Asbestos', 'Other'];
const LEAD_SOURCES = ['Website', 'Referral', 'Google Ads', 'Campaign', 'LinkedIn', 'Event', 'Cold Call', 'Other'];
const EXECUTIVES = ['Amit Verma', 'Pooja Sharma', 'Rahul Mehta', 'Sneha Iyer'];

// ─── Validation ───────────────────────────────────────────────────────────────

interface FormErrors {
  customerName?: string;
  phone?: string;
  followUp?: string;
}

function validate(form: LeadFormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.customerName.trim()) errors.customerName = 'Customer name is required';
  if (!form.phone.trim()) errors.phone = 'Mobile number is required';
  else if (!/^\d{7,15}$/.test(form.phone.replace(/\s/g, '')))
    errors.phone = 'Enter a valid mobile number';
  if (!form.followUp) errors.followUp = 'Follow-up date is required';
  return errors;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<LeadItem, 'id'>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddLeadModal({ isOpen, onClose, onSave }: AddLeadModalProps) {
  const [form, setForm] = useState<LeadFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const set = (field: keyof LeadFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleSubmit = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSaving(true);

    // Simulate async save
    setTimeout(() => {
      const followUpDate = form.followUp
        ? new Date(form.followUp).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })
        : '';

      onSave({
        customerName: form.customerName.trim(),
        phone: form.phone.replace(/\s/g, ''),
        followUp: followUpDate,
        status: 'New' as LeadStatus,
        billAmount: parseFloat(form.billAmount) || 0,
        state: form.state,
        city: form.city.trim(),
        source: form.source || 'Website',
        executive: form.executive || EXECUTIVES[0],
      });

      setForm(EMPTY_FORM);
      setIsSaving(false);
      onClose();
    }, 400);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" closeOnOverlayClick={!isSaving}>
      <Modal.Header title="Add New Lead" onClose={handleClose} />

      <Modal.Content>
        <div className={styles.form}>

          {/* Customer Name — full width */}
          <Input
            label="Customer Name"
            placeholder="Enter customer name"
            required
            value={form.customerName}
            onChange={(e) => set('customerName')(e.target.value)}
            error={errors.customerName}
          />

          {/* Mobile + Email */}
          <div className={styles.row}>
            <Input
              label="Mobile Number"
              placeholder="e.g. 9876543210"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => set('phone')(e.target.value)}
              error={errors.phone}
            />
            <Input
              label="Email"
              placeholder="email@example.com"
              type="email"
              value={form.email}
              onChange={(e) => set('email')(e.target.value)}
            />
          </div>

          {/* Address — full width */}
          <Input
            label="Address"
            placeholder="Enter address"
            value={form.address}
            onChange={(e) => set('address')(e.target.value)}
          />

          {/* Bill Amount + Follow-up Date */}
          <div className={styles.row}>
            <Input
              label="Monthly Bill Amount (₹)"
              placeholder="e.g. 5000"
              type="number"
              min="0"
              value={form.billAmount}
              onChange={(e) => set('billAmount')(e.target.value)}
            />

            {/* Native date input styled to match design */}
            <div className={styles.dateWrapper}>
              <label className={`${styles.dateLabel} ${styles['dateLabel--required']}`}>
                Follow-up Date
              </label>
              <input
                type="date"
                className={`${styles.dateInput} ${errors.followUp ? styles['dateInput--error'] : ''}`}
                value={form.followUp}
                onChange={(e) => set('followUp')(e.target.value)}
                aria-label="Follow-up date"
                aria-required="true"
              />
              {errors.followUp && (
                <span className={styles.fieldError}>{errors.followUp}</span>
              )}
            </div>
          </div>

          {/* State + City */}
          <div className={styles.row}>
            <Dropdown
              label="State"
              placeholder="Select State"
              options={INDIAN_STATES}
              value={form.state}
              onChange={(v) => set('state')(String(v))}
              isSearchable
            />
            <Input
              label="City"
              placeholder="Enter city"
              value={form.city}
              onChange={(e) => set('city')(e.target.value)}
            />
          </div>

          {/* Roof Ownership + Roof Type */}
          <div className={styles.row}>
            <Dropdown
              label="Roof Ownership"
              placeholder="Select"
              options={ROOF_OWNERSHIP}
              value={form.roofOwnership}
              onChange={(v) => set('roofOwnership')(String(v))}
            />
            <Dropdown
              label="Roof Type"
              placeholder="Select"
              options={ROOF_TYPES}
              value={form.roofType}
              onChange={(v) => set('roofType')(String(v))}
            />
          </div>

          {/* Lead Source + Assigned Executive */}
          <div className={styles.row}>
            <Dropdown
              label="Lead Source"
              placeholder="Select Source"
              options={LEAD_SOURCES}
              value={form.source}
              onChange={(v) => set('source')(String(v))}
            />
            <Dropdown
              label="Assigned Executive"
              placeholder="Select Executive"
              options={EXECUTIVES}
              value={form.executive}
              onChange={(v) => set('executive')(String(v))}
            />
          </div>

        </div>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="secondary" size="md" onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleSubmit} isLoading={isSaving}>
          Save Lead
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
