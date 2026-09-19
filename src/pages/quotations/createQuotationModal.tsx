import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { useToast } from '@/shared/components/ui/toast/toast';
import { createQuotation } from '@/shared/lib/api/quotationsApi';
import { listLeads } from '@/shared/lib/api/leadsApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import type {
  Quotation,
  CreateQuotationPayload,
  CreateQuotationItemPayload,
  Lead,
} from '@/shared/lib/types';
import styles from './createQuotationModal.module.scss';

// ─── Constants & Options ──────────────────────────────────────────────────────

const SYSTEM_TYPES = [
  { label: 'On-Grid (Grid-Tied)', value: 'ON_GRID' },
  { label: 'Off-Grid (Standalone)', value: 'OFF_GRID' },
  { label: 'Hybrid (Grid + Battery)', value: 'HYBRID' },
];

const ITEM_TYPES = [
  { label: 'Solar Panel / Module', value: 'SOLAR_PANEL' },
  { label: 'Solar Inverter', value: 'INVERTER' },
  { label: 'Battery Storage', value: 'BATTERY' },
  { label: 'Mounting Structure', value: 'STRUCTURE' },
  { label: 'Balance of System (BOS)', value: 'BOS' },
  { label: 'Installation & Labor', value: 'INSTALLATION' },
  { label: 'Other', value: 'OTHER' },
];

const GST_RATES = [
  { label: '0% (Exempt)', value: 0 },
  { label: '5% (Concessional)', value: 5 },
  { label: '12% (Solar PV Standard)', value: 12 },
  { label: '18% (Standard GST)', value: 18 },
  { label: '28% (Luxury / Higher)', value: 28 },
];

const UNITS = [
  { label: 'Numbers (NOS)', value: 'NOS' },
  { label: 'Kilowatt (KW)', value: 'KW' },
  { label: 'Set (SET)', value: 'SET' },
  { label: 'Meters (MTR)', value: 'MTR' },
  { label: 'Lot (LOT)', value: 'LOT' },
];

interface FormItemState {
  id: string;
  itemName: string;
  itemType: string;
  brand: string;
  model: string;
  quantity: string;
  unit: string;
  rate: string;
  gstRate: number;
}

const DEFAULT_FIRST_ITEM: FormItemState = {
  id: '1',
  itemName: 'Mono PERC Half-Cut Solar Modules',
  itemType: 'SOLAR_PANEL',
  brand: 'Tata Solar',
  model: '545W Mono PERC',
  quantity: '1',
  unit: 'SET',
  rate: '150000',
  gstRate: 12,
};

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (quotation: Quotation) => void;
  initialLeadId?: string;
  initialCustomerName?: string;
}

export const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialLeadId,
  initialCustomerName,
}) => {
  const { addToast } = useToast();

  // ── Leads list for lead picker ─────────────────────────────────────────────
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // ── Form State ─────────────────────────────────────────────────────────────
  const [leadId, setLeadId] = useState(initialLeadId || '');
  const [systemSizeKw, setSystemSizeKw] = useState('3');
  const [systemType, setSystemType] = useState<'ON_GRID' | 'OFF_GRID' | 'HYBRID'>('ON_GRID');
  const [inverterCapacityKw, setInverterCapacityKw] = useState('3.3');
  const [batteryCapacityKwh, setBatteryCapacityKwh] = useState('');
  const [panelCount, setPanelCount] = useState('6');
  const [panelWattage, setPanelWattage] = useState('545');
  const [roofAreaSqft, setRoofAreaSqft] = useState('300');
  const [validityDays, setValidityDays] = useState('30');
  const [centralSubsidy, setCentralSubsidy] = useState('78000');
  const [stateSubsidy, setStateSubsidy] = useState('0');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(
    '1. 5 Years comprehensive system warranty.\n2. 25 Years linear solar module output warranty.\n3. Net metering approvals subject to DISCOM guidelines.'
  );

  const [items, setItems] = useState<FormItemState[]>([DEFAULT_FIRST_ITEM]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      if (initialLeadId) {
        setLeadId(initialLeadId);
      } else {
        // Fetch recent leads to populate dropdown
        setIsLoadingLeads(true);
        listLeads({ limit: 50 })
          .then((res) => {
            setLeadsList(res.data || []);
          })
          .catch(() => {})
          .finally(() => setIsLoadingLeads(false));
      }
    }
  }, [isOpen, initialLeadId]);

  // Lead dropdown options
  const leadOptions = useMemo(() => {
    return leadsList.map((l) => ({
      label: `${l.customerName} (${l.mobileNumber})`,
      value: l.id,
    }));
  }, [leadsList]);

  // ── Item management ────────────────────────────────────────────────────────
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        itemName: '',
        itemType: 'BOS',
        brand: '',
        model: '',
        quantity: '1',
        unit: 'NOS',
        rate: '0',
        gstRate: 12,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof FormItemState, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // ── Financial Live Calculations ────────────────────────────────────────────
  const { subtotal, totalGst, grandTotal, netCustomerCost } = useMemo(() => {
    let sub = 0;
    let gst = 0;

    items.forEach((item) => {
      const q = parseFloat(item.quantity) || 0;
      const r = parseFloat(item.rate) || 0;
      const preTax = q * r;
      const itemGst = preTax * (item.gstRate / 100);

      sub += preTax;
      gst += itemGst;
    });

    const grand = sub + gst;
    const cSub = parseFloat(centralSubsidy) || 0;
    const sSub = parseFloat(stateSubsidy) || 0;
    const net = Math.max(0, grand - cSub - sSub);

    return {
      subtotal: Math.round(sub * 100) / 100,
      totalGst: Math.round(gst * 100) / 100,
      grandTotal: Math.round(grand * 100) / 100,
      netCustomerCost: Math.round(net * 100) / 100,
    };
  }, [items, centralSubsidy, stateSubsidy]);

  // ── Submission & Validation ────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs: Record<string, string> = {};

    if (!leadId) {
      errs.leadId = 'Please select a lead for this quotation';
    }

    const size = parseFloat(systemSizeKw);
    if (!size || size <= 0) {
      errs.systemSizeKw = 'System size must be greater than 0 kW';
    }

    if (items.length === 0) {
      errs.items = 'At least one line item is required';
    }

    // Check each line item
    items.forEach((it, idx) => {
      if (!it.itemName.trim()) {
        errs[`item_${idx}_name`] = 'Item name is required';
      }
      const q = parseFloat(it.quantity);
      if (!q || q <= 0) {
        errs[`item_${idx}_qty`] = 'Quantity must be > 0';
      }
      const r = parseFloat(it.rate);
      if (isNaN(r) || r < 0) {
        errs[`item_${idx}_rate`] = 'Rate must be valid';
      }
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      addToast({
        title: 'Validation Error',
        description: 'Please review all highlighted fields before submitting.',
        variant: 'error',
      });
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const days = validityDays ? parseInt(validityDays, 10) : 30;
      const vDate = new Date();
      vDate.setDate(vDate.getDate() + days);

      const payload: CreateQuotationPayload = {
        leadId,
        systemSizeKw: parseFloat(systemSizeKw),
        systemType,
        inverterCapacityKw: inverterCapacityKw ? parseFloat(inverterCapacityKw) : undefined,
        batteryCapacityKwh: batteryCapacityKwh ? parseFloat(batteryCapacityKwh) : undefined,
        panelCount: panelCount ? parseInt(panelCount, 10) : undefined,
        panelWattage: panelWattage ? parseInt(panelWattage, 10) : undefined,
        roofAreaSqft: roofAreaSqft ? parseFloat(roofAreaSqft) : undefined,
        validityDays: days,
        validityDate: vDate.toISOString(),
        centralSubsidy: centralSubsidy ? parseFloat(centralSubsidy) : 0,
        stateSubsidy: stateSubsidy ? parseFloat(stateSubsidy) : 0,
        notes: notes.trim() || undefined,
        termsAndConditions: termsAndConditions.trim() || undefined,
        items: items.map((it): CreateQuotationItemPayload => ({
          name: it.itemName.trim(),
          itemName: it.itemName.trim(),
          itemType: it.itemType || undefined,
          brand: it.brand.trim() || undefined,
          model: it.model.trim() || undefined,
          quantity: parseFloat(it.quantity) || 1,
          unit: it.unit || 'NOS',
          rate: parseFloat(it.rate) || 0,
          gstRate: it.gstRate,
        })),
      };

      const res = await createQuotation(payload);
      addToast({
        title: 'Quotation Created',
        description: `Quote ${res.data.quoteNumber} generated successfully.`,
        variant: 'success',
      });

      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Failed to Create Quotation',
        description: msg,
        variant: 'error',
      });
      setErrors({ submit: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" closeOnOverlayClick={!isSaving}>
      <Modal.Header title="Create Solar Quotation" onClose={onClose} />

      <Modal.Content>
        <div className={styles.form}>
          {/* 1. Lead Selection */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>1. Customer & Lead Information</h4>
            </div>

            {initialLeadId ? (
              <div className={styles.lockedLeadInfo}>
                <span>
                  <strong>Lead:</strong> {initialCustomerName || 'Selected Lead'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  ID: {initialLeadId}
                </span>
              </div>
            ) : (
              <Dropdown
                label="Select Lead *"
                placeholder={isLoadingLeads ? 'Loading leads...' : 'Choose a customer lead'}
                options={leadOptions}
                value={leadId}
                onChange={(val) => setLeadId(String(val || ''))}
                isSearchable
                error={errors.leadId}
                disabled={isLoadingLeads}
              />
            )}
          </div>

          {/* 2. System Specifications */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>2. System Specifications</h4>
            </div>

            <div className={styles.row3}>
              <Input
                label="System Size (kW) *"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 3.5"
                value={systemSizeKw}
                onChange={(e) => setSystemSizeKw(e.target.value)}
                error={errors.systemSizeKw}
              />

              <Dropdown
                label="System Type"
                options={SYSTEM_TYPES}
                value={systemType}
                onChange={(val) => setSystemType(val as any)}
              />

              <Input
                label="Inverter Capacity (kW)"
                type="number"
                step="0.1"
                placeholder="e.g. 3.3"
                value={inverterCapacityKw}
                onChange={(e) => setInverterCapacityKw(e.target.value)}
              />
            </div>

            <div className={styles.row3}>
              <Input
                label="Panel Count"
                type="number"
                placeholder="e.g. 6"
                value={panelCount}
                onChange={(e) => setPanelCount(e.target.value)}
              />

              <Input
                label="Panel Wattage (Wp)"
                type="number"
                placeholder="e.g. 545"
                value={panelWattage}
                onChange={(e) => setPanelWattage(e.target.value)}
              />

              <Input
                label="Roof Area (sq ft)"
                type="number"
                placeholder="e.g. 350"
                value={roofAreaSqft}
                onChange={(e) => setRoofAreaSqft(e.target.value)}
              />
            </div>

            {(systemType === 'OFF_GRID' || systemType === 'HYBRID') && (
              <div className={styles.row}>
                <Input
                  label="Battery Capacity (kWh)"
                  type="number"
                  step="0.5"
                  placeholder="e.g. 5.0"
                  value={batteryCapacityKwh}
                  onChange={(e) => setBatteryCapacityKwh(e.target.value)}
                />
                <Input
                  label="Validity (Days)"
                  type="number"
                  placeholder="30"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* 3. Dynamic Line Items */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>3. Quotation Line Items</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                leftIcon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                }
              >
                Add Item
              </Button>
            </div>

            {errors.items && <span className={styles.fieldError}>{errors.items}</span>}

            <div className={styles.itemsContainer}>
              {items.map((item, idx) => {
                const q = parseFloat(item.quantity) || 0;
                const r = parseFloat(item.rate) || 0;
                const preTax = q * r;
                const gst = preTax * (item.gstRate / 100);
                const total = preTax + gst;

                return (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.itemCardHeader}>
                      <span className={styles.itemIndexBadge}>Item #{idx + 1}</span>
                      <button
                        type="button"
                        className={styles.deleteItemBtn}
                        onClick={() => removeItem(idx)}
                        disabled={items.length <= 1}
                        title={items.length <= 1 ? 'Minimum 1 item required' : 'Remove item'}
                        aria-label="Remove item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>

                    <div className={styles.row}>
                      <Input
                        label="Item Name *"
                        placeholder="e.g. Mono PERC Panels"
                        value={item.itemName}
                        onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                        error={errors[`item_${idx}_name`]}
                      />
                      <Dropdown
                        label="Item Type"
                        options={ITEM_TYPES}
                        value={item.itemType}
                        onChange={(val) => updateItem(idx, 'itemType', val)}
                      />
                    </div>

                    <div className={styles.row}>
                      <Input
                        label="Brand / Manufacturer"
                        placeholder="e.g. Waree / Growatt"
                        value={item.brand}
                        onChange={(e) => updateItem(idx, 'brand', e.target.value)}
                      />
                      <Input
                        label="Model / Specs"
                        placeholder="e.g. 545W Mono PERC"
                        value={item.model}
                        onChange={(e) => updateItem(idx, 'model', e.target.value)}
                      />
                    </div>

                    <div className={styles.row4}>
                      <Input
                        label="Quantity *"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        error={errors[`item_${idx}_qty`]}
                      />
                      <Dropdown
                        label="Unit"
                        options={UNITS}
                        value={item.unit}
                        onChange={(val) => updateItem(idx, 'unit', val)}
                      />
                      <Input
                        label="Rate (₹ Pre-Tax) *"
                        type="number"
                        min="0"
                        placeholder="e.g. 150000"
                        value={item.rate}
                        onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                        error={errors[`item_${idx}_rate`]}
                      />
                      <Dropdown
                        label="GST Rate"
                        options={GST_RATES}
                        value={item.gstRate}
                        onChange={(val) => updateItem(idx, 'gstRate', Number(val))}
                      />
                    </div>

                    <div className={styles.itemLiveTotal}>
                      <span>Pre-Tax: ₹{preTax.toLocaleString('en-IN')}</span>
                      <span>GST ({item.gstRate}%): ₹{gst.toLocaleString('en-IN')}</span>
                      <strong>Line Total: ₹{total.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Subsidies & Notes */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>4. Subsidies & Terms</h4>
            </div>

            <div className={styles.row}>
              <Input
                label="Central Subsidy (₹ MNRE / PM Surya Ghar)"
                type="number"
                min="0"
                placeholder="e.g. 78000"
                value={centralSubsidy}
                onChange={(e) => setCentralSubsidy(e.target.value)}
              />
              <Input
                label="State Subsidy (₹ DISCOM / State)"
                type="number"
                min="0"
                placeholder="e.g. 0"
                value={stateSubsidy}
                onChange={(e) => setStateSubsidy(e.target.value)}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.textareaWrapper}>
                <label className={styles.textareaLabel}>Special Notes / Scope of Work</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  placeholder="e.g. Includes structure fabrication, earthing kit, and testing."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className={styles.textareaWrapper}>
                <label className={styles.textareaLabel}>Terms & Conditions</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 5. Live Financial Summary Card */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span>Subtotal (Pre-Tax Items):</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Total Goods & Service Tax (GST):</span>
              <span>+ ₹{totalGst.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Gross Project Cost:</span>
              <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>
            </div>

            {parseFloat(centralSubsidy) > 0 && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Central Subsidy (MNRE):</span>
                <span>- ₹{parseFloat(centralSubsidy).toLocaleString('en-IN')}</span>
              </div>
            )}

            {parseFloat(stateSubsidy) > 0 && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>State DISCOM Subsidy:</span>
                <span>- ₹{parseFloat(stateSubsidy).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className={styles.summaryDivider} />

            <div className={styles.summaryTotalRow}>
              <span>Net Customer Cost (Out of Pocket):</span>
              <span className={styles.netAmount}>
                ₹{netCustomerCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </Modal.Content>

      <Modal.Footer>
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} isLoading={isSaving}>
          Generate Quotation
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
