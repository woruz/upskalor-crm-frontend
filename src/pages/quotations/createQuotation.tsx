import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { Button } from '@/shared/components/ui/button/button';
import { Input } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { Badge } from '@/shared/components/ui/badge/badge';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { createQuotation } from '@/shared/lib/api/quotationsApi';
import { listLeads, getLeadById } from '@/shared/lib/api/leadsApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import { ROUTES } from '@/shared/lib/config/routes';
import type {
  CreateQuotationPayload,
  CreateQuotationItemPayload,
  Lead,
} from '@/shared/lib/types';
import styles from './createQuotation.module.scss';

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

export const CreateQuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryLeadId = searchParams.get('leadId') || '';

  const { user } = useAuth();
  const { addToast } = useToast();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  // ── Leads list for lead picker ─────────────────────────────────────────────
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // ── Form State ─────────────────────────────────────────────────────────────
  const [leadId, setLeadId] = useState(queryLeadId);
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

  // ── Load lead information ──────────────────────────────────────────────────
  const fetchLeadInfo = useCallback(async (id: string) => {
    try {
      const res = await getLeadById(id);
      setSelectedLead(res.data);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (queryLeadId) {
      setLeadId(queryLeadId);
      fetchLeadInfo(queryLeadId);
    } else {
      setIsLoadingLeads(true);
      listLeads({ limit: 100 })
        .then((res) => {
          setLeadsList(res.data || []);
        })
        .catch(() => {})
        .finally(() => setIsLoadingLeads(false));
    }
  }, [queryLeadId, fetchLeadInfo]);

  // Lead dropdown options
  const leadOptions = useMemo(() => {
    return leadsList.map((l) => ({
      label: `${l.customerName} (${l.mobileNumber})${l.city ? ` - ${l.city}` : ''}`,
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
      errs.leadId = 'Please select a customer lead for this quotation';
    }

    const size = parseFloat(systemSizeKw);
    if (!size || size <= 0) {
      errs.systemSizeKw = 'System size must be greater than 0 kW';
    }

    if (items.length === 0) {
      errs.items = 'At least one line item is required';
    }

    // Validate line items
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

      navigate(`/quotations/${res.data.id}`);
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

  const backUrl = queryLeadId ? `/leads/${queryLeadId}` : ROUTES.QUOTATIONS;
  const backLabel = queryLeadId ? 'Back to Lead Details' : 'Back to Quotations';

  return (
    <AppLayout
      headerProps={{
        title: 'Create Quotation',
        breadcrumbs: [
          { label: 'CRM' },
          { label: 'Quotations' },
          { label: 'New Solar Proposal' },
        ],
        userName: fullName || user?.email || 'User',
        userRole: user?.role || 'user',
        notificationCount: 3,
      }}
    >
      <div className={styles.page}>
        {/* Top Navigation */}
        <div className={styles.topNav}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(backUrl)}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            {backLabel}
          </Button>
        </div>

        {/* Page Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Generate Solar Proposal & Quotation
            </h1>
            <p className={styles.pageSubtitle}>
              Configure system specifications, customize equipment line items, and calculate consumer subsidies.
            </p>
          </div>
          <Badge variant="primary" pill>
            Draft Proposal
          </Badge>
        </div>

        {/* Form & Sidebar Grid */}
        <div className={styles.contentGrid}>
          {/* Main Form Column */}
          <div className={styles.mainColumn}>
            {/* 1. Customer & Lead Selection */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  1. Customer & Lead Information
                </h2>
              </div>

              {queryLeadId || selectedLead ? (
                <div className={styles.lockedLeadInfo}>
                  <div>
                    <strong style={{ fontSize: '0.9375rem', display: 'block', marginBottom: '2px' }}>
                      {selectedLead?.customerName || 'Selected Lead'}
                    </strong>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      {[
                        selectedLead?.mobileNumber,
                        selectedLead?.email,
                        selectedLead?.city,
                        selectedLead?.state,
                      ]
                        .filter(Boolean)
                        .join(' • ') || `ID: ${queryLeadId}`}
                    </div>
                  </div>
                  <Link to={`/leads/${leadId}`} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm">
                      View Lead Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <Dropdown
                    label="Select Customer Lead *"
                    placeholder={isLoadingLeads ? 'Loading leads...' : 'Choose an active customer lead'}
                    options={leadOptions}
                    value={leadId}
                    onChange={(val) => setLeadId(String(val || ''))}
                    isSearchable
                    error={errors.leadId}
                    disabled={isLoadingLeads}
                  />
                  {errors.leadId && <span className={styles.fieldError}>{errors.leadId}</span>}
                </div>
              )}
            </section>

            {/* 2. System Specifications */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  2. Solar System Specifications
                </h2>
              </div>

              <div className={styles.row3}>
                <Input
                  label="System Capacity (kW) *"
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
                  placeholder="e.g. 300"
                  value={roofAreaSqft}
                  onChange={(e) => setRoofAreaSqft(e.target.value)}
                />
              </div>

              <div className={styles.row}>
                {(systemType === 'OFF_GRID' || systemType === 'HYBRID') && (
                  <Input
                    label="Battery Capacity (kWh)"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 5.0"
                    value={batteryCapacityKwh}
                    onChange={(e) => setBatteryCapacityKwh(e.target.value)}
                  />
                )}
                <Input
                  label="Quotation Validity (Days)"
                  type="number"
                  placeholder="30"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                />
              </div>
            </section>

            {/* 3. Quotation Line Items & Bill of Materials */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  3. Bill of Materials & Line Items ({items.length})
                </h2>
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
                  Add Line Item
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
                          placeholder="e.g. Mono PERC Half-Cut Modules"
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
                          placeholder="e.g. Tata Solar / Growatt"
                          value={item.brand}
                          onChange={(e) => updateItem(idx, 'brand', e.target.value)}
                        />
                        <Input
                          label="Model / Specifications"
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
            </section>

            {/* 4. Subsidies, Scope & Terms */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  4. Subsidies & Terms
                </h2>
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
                  label="State Subsidy (₹ DISCOM / State Scheme)"
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
                    rows={3}
                    placeholder="e.g. Includes structure fabrication, earthing kit, and net metering documentation."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className={styles.textareaWrapper}>
                  <label className={styles.textareaLabel}>Terms & Conditions</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Sidebar Financial Summary Column */}
          <aside className={styles.sidebarColumn}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Quotation Financial Summary
              </h2>

              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span>Subtotal (Pre-Tax):</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Estimated Total GST:</span>
                  <span>+ ₹{totalGst.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Gross Project Cost:</span>
                  <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>
                </div>

                {parseFloat(centralSubsidy) > 0 && (
                  <div className={`${styles.summaryRow} ${styles.discount}`}>
                    <span>PM Surya Ghar (MNRE):</span>
                    <span>- ₹{parseFloat(centralSubsidy).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {parseFloat(stateSubsidy) > 0 && (
                  <div className={`${styles.summaryRow} ${styles.discount}`}>
                    <span>State Subsidy:</span>
                    <span>- ₹{parseFloat(stateSubsidy).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className={styles.summaryDivider} />

                <div className={styles.summaryTotalBox}>
                  <span className={styles.summaryTotalLabel}>Net Customer Cost</span>
                  <span className={styles.netAmount}>
                    ₹{netCustomerCost.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    Out of pocket after government subsidies
                  </span>
                </div>
              </div>

              <div className={styles.actionBtns}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleSubmit}
                  isLoading={isSaving}
                  leftIcon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  }
                >
                  Generate Quotation
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => navigate(backUrl)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateQuotationPage;
