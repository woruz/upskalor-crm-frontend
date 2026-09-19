import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { useToast } from '@/shared/components/ui/toast/toast';
import { createLead } from '@/shared/lib/api/leadsApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import type { Lead, LeadStatus } from '@/shared/lib/types';
import styles from './addLeadModal.module.scss';

// ─── Form state ───────────────────────────────────────────────────────────────

interface LeadFormState {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  billAmount: string;
  followUp: string;
  status: LeadStatus;
  state: string;
  city: string;
  roofOwnership: string;
  roofType: string;
  source: string;
}

const EMPTY_FORM: LeadFormState = {
  customerName: '',
  phone: '',
  email: '',
  address: '',
  billAmount: '',
  followUp: '',
  status: 'NEW',
  state: '',
  city: '',
  roofOwnership: '',
  roofType: '',
  source: 'Website',
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

const ROOF_OWNERSHIP = ['Owned', 'Rented', 'Commercial', 'Leased'];
const ROOF_TYPES = ['Concrete Flat', 'Metal Shed', 'Tiled / Sloped', 'Asbestos', 'Other'];
const LEAD_SOURCES = ['Website', 'Referral', 'Campaign', 'Cold Call', 'Direct Referral', 'Other'];

const LEAD_STATUS_OPTIONS: { label: string; value: LeadStatus }[] = [
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Follow Up', value: 'FOLLOW_UP' },
  { label: 'Interested', value: 'INTERESTED' },
  { label: 'Not Interested', value: 'NOT_INTERESTED' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'Lost', value: 'LOST' },
];

// ─── Validation ───────────────────────────────────────────────────────────────

interface FormErrors {
  customerName?: string;
  phone?: string;
  email?: string;
  followUp?: string;
}

function validate(form: LeadFormState): FormErrors {
  const errors: FormErrors = {};
  const trimmedName = form.customerName.trim();
  if (!trimmedName) {
    errors.customerName = 'Customer name is required';
  } else if (trimmedName.length < 2 || trimmedName.length > 150) {
    errors.customerName = 'Customer name must be between 2 and 150 characters';
  }

  const cleanPhone = form.phone.replace(/[\s-]/g, '');
  if (!cleanPhone) {
    errors.phone = 'Mobile number is required';
  } else if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6-9)';
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!form.followUp) {
    errors.followUp = 'Follow-up date is required';
  }

  return errors;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (lead: Lead) => void;
  onSave?: (lead: any) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddLeadModal({ isOpen, onClose, onSuccess, onSave }: AddLeadModalProps) {
  const { addToast } = useToast();
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

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSaving(true);

    try {
      // Build ISO followUpDate
      const followUpIso = new Date(form.followUp).toISOString();
      const cleanPhone = form.phone.replace(/[\s-]/g, '');

      const response = await createLead({
        customerName: form.customerName.trim(),
        mobileNumber: cleanPhone,
        followUpDate: followUpIso,
        status: form.status,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        monthlyBillAmount: form.billAmount ? parseFloat(form.billAmount) : undefined,
        state: form.state || undefined,
        city: form.city.trim() || undefined,
        roofOwnership: form.roofOwnership || undefined,
        roofType: form.roofType || undefined,
        leadSource: form.source || undefined,
      });

      addToast({
        title: 'Lead Created',
        description: `Lead "${response.data.customerName}" created successfully.`,
        variant: 'success',
      });

      onSuccess?.(response.data);
      onSave?.(response.data);

      setForm(EMPTY_FORM);
      onClose();
    } catch (error) {
      const message = extractApiError(error);
      addToast({
        title: 'Failed to create lead',
        description: message,
        variant: 'error',
      });
      setErrors({ customerName: message });
    } finally {
      setIsSaving(false);
    }
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
              label="Mobile Number (10 digits)"
              placeholder="e.g. 9876543210"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => set('phone')(e.target.value)}
              error={errors.phone}
              helpText="Indian format: 10 digits starting with 6-9"
            />
            <Input
              label="Email"
              placeholder="email@example.com"
              type="email"
              value={form.email}
              onChange={(e) => set('email')(e.target.value)}
              error={errors.email}
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

          {/* Initial Status + Lead Source */}
          <div className={styles.row}>
            <Dropdown
              label="Status"
              placeholder="Select Status"
              options={LEAD_STATUS_OPTIONS}
              value={form.status}
              onChange={(v) => set('status')(String(v))}
            />
            <Dropdown
              label="Lead Source"
              placeholder="Select Source"
              options={LEAD_SOURCES}
              value={form.source}
              onChange={(v) => set('source')(String(v))}
            />
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
