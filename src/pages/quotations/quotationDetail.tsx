import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { Button } from '@/shared/components/ui/button/button';
import { Badge } from '@/shared/components/ui/badge/badge';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { Spinner } from '@/shared/components/ui/spinner/spinner';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import {
  getQuotationById,
  updateQuotation,
  deleteQuotation,
} from '@/shared/lib/api/quotationsApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import type { Quotation, QuotationStatus } from '@/shared/lib/types';
import styles from './quotationDetail.module.scss';

const STATUS_OPTIONS: { label: string; value: QuotationStatus }[] = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent to Customer', value: 'SENT' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Expired', value: 'EXPIRED' },
];

const getStatusBadgeVariant = (status: QuotationStatus) => {
  switch (status) {
    case 'ACCEPTED':
      return 'success';
    case 'SENT':
      return 'info';
    case 'DRAFT':
      return 'secondary';
    case 'REJECTED':
      return 'error';
    case 'EXPIRED':
      return 'warning';
    default:
      return 'default';
  }
};

export const QuotationDetailPage: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const [quote, setQuote] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch Quotation ────────────────────────────────────────────────────────
  const loadQuotation = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await getQuotationById(id);
      setQuote(res.data);
    } catch (err) {
      const msg = extractApiError(err);
      setError(msg);
      addToast({
        title: 'Quotation Not Found',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    loadQuotation();
  }, [loadQuotation]);

  // ── Status Change Handler ──────────────────────────────────────────────────
  const handleStatusChange = async (newStatus: QuotationStatus) => {
    if (!quote || quote.status === newStatus) return;

    let reason: string | undefined = undefined;
    if (newStatus === 'REJECTED') {
      const promptRes = window.prompt('Please enter the reason for rejection (optional):');
      if (promptRes === null) return; // cancelled
      reason = promptRes.trim() || undefined;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await updateQuotation(quote.id, {
        status: newStatus,
        rejectionReason: reason,
      });

      setQuote(res.data);
      addToast({
        title: 'Status Updated',
        description: `Quotation status updated to "${newStatus}".`,
        variant: 'success',
      });
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Failed to update status',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ── Delete Quotation ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!quote) return;
    if (!window.confirm(`Are you sure you want to delete quotation "${quote.quoteNumber}"?`)) {
      return;
    }

    try {
      await deleteQuotation(quote.id);
      addToast({
        title: 'Quotation Deleted',
        description: `Quote "${quote.quoteNumber}" has been removed.`,
        variant: 'success',
      });
      navigate('/quotations');
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Delete Failed',
        description: msg,
        variant: 'error',
      });
    }
  };

  // ── Loading & Error States ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout
        headerProps={{
          title: 'Quotation Details',
          breadcrumbs: [{ label: 'CRM' }, { label: 'Quotations' }],
          userName: fullName || user?.email || 'User',
          userRole: user?.role || 'user',
        }}
      >
        <div className={styles.loadingCenter}>
          <Spinner size="lg" />
          <p>Loading quotation details…</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !quote) {
    return (
      <AppLayout
        headerProps={{
          title: 'Quotation Details',
          breadcrumbs: [{ label: 'CRM' }, { label: 'Quotations' }],
          userName: fullName || user?.email || 'User',
          userRole: user?.role || 'user',
        }}
      >
        <div className={styles.loadingCenter}>
          <h3>Quotation not found</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {error || 'The requested quotation does not exist.'}
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/quotations')}>
            Back to Quotations
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      headerProps={{
        title: `${quote.quoteNumber} - Solar Quotation`,
        breadcrumbs: [
          { label: 'CRM' },
          { label: 'Quotations' },
          { label: quote.quoteNumber },
        ],
        userName: fullName || user?.email || 'User',
        userRole: user?.role || 'user',
      }}
    >
      <div className={styles.page}>
        {/* Back Navigation */}
        <div className={styles.backNav}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/quotations')}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            Back to Quotations
          </Button>
        </div>

        {/* Top Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.headerLeft}>
            <div className={styles.quoteTitleRow}>
              <h2 className={styles.quoteNumber}>{quote.quoteNumber}</h2>
              <Badge variant="secondary" size="sm">
                Version {quote.version || 1}
              </Badge>
              <Badge variant={getStatusBadgeVariant(quote.status)} pill>
                {quote.status}
              </Badge>
            </div>
            <div className={styles.headerMeta}>
              <span>
                Created: {new Date(quote.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </span>
              <span>
                Valid Until:{' '}
                {quote.validityDate
                  ? new Date(quote.validityDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })
                  : '30 Days'}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.statusDropdownWrapper}>
              <Dropdown
                size="sm"
                label="Update Status"
                options={STATUS_OPTIONS}
                value={quote.status}
                onChange={(val) => handleStatusChange(val as QuotationStatus)}
                disabled={isUpdatingStatus}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
              }
            >
              Print / PDF
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              leftIcon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              }
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Two-Column Detail View */}
        <div className={styles.layout}>
          {/* Left Column: Specifications & Line Items */}
          <div className={styles.leftCol}>
            {/* 1. System Specifications */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                </svg>
                Solar System Technical Specifications
              </h3>

              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>System Capacity</span>
                  <span className={styles.specValue}>{quote.systemSizeKw} kW</span>
                </div>

                <div className={styles.specItem}>
                  <span className={styles.specLabel}>System Type</span>
                  <span className={styles.specValue}>
                    {quote.systemType?.replace('_', ' ') || 'ON GRID'}
                  </span>
                </div>

                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Inverter Capacity</span>
                  <span className={styles.specValue}>
                    {quote.inverterCapacityKw ? `${quote.inverterCapacityKw} kW` : '-'}
                  </span>
                </div>

                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Panel Array</span>
                  <span className={styles.specValue}>
                    {quote.panelCount
                      ? `${quote.panelCount} × ${quote.panelWattage || 0}W`
                      : '-'}
                  </span>
                </div>

                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Roof Space Required</span>
                  <span className={styles.specValue}>
                    {quote.roofAreaSqft ? `${quote.roofAreaSqft} sq ft` : '-'}
                  </span>
                </div>

                {quote.batteryCapacityKwh && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Battery Capacity</span>
                    <span className={styles.specValue}>{quote.batteryCapacityKwh} kWh</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Line Items Table */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Quotation Line Items & Bill of Materials ({quote.items?.length || 0})
              </h3>

              <div className={styles.itemsTableWrapper}>
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item & Description</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Rate (Pre-Tax)</th>
                      <th>GST</th>
                      <th>Pre-Tax Total</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(quote.items || []).map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <div className={styles.itemNameCell}>
                            <span className={styles.itemNameText}>{item.itemName}</span>
                            {(item.brand || item.model) && (
                              <span className={styles.itemSubText}>
                                {[item.brand, item.model].filter(Boolean).join(' • ')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge variant="secondary" size="sm">
                            {item.itemType?.replace('_', ' ') || 'EQUIPMENT'}
                          </Badge>
                        </td>
                        <td>
                          {item.quantity} {item.unit || 'NOS'}
                        </td>
                        <td>₹{item.rate.toLocaleString('en-IN')}</td>
                        <td>
                          {item.gstRate}%
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                            +₹{(item.gstAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td>₹{(item.preTaxAmount || item.quantity * item.rate).toLocaleString('en-IN')}</td>
                        <td>₹{(item.totalAmount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Payment Milestones */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Recommended Payment Schedule
              </h3>

              <div className={styles.milestonesGrid}>
                <div className={styles.milestoneCard}>
                  <span className={styles.milestonePercent}>20%</span>
                  <span className={styles.milestoneLabel}>Booking & Site Survey</span>
                  <span className={styles.milestoneAmount}>
                    ₹{Math.round(quote.netCustomerCost * 0.2).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className={styles.milestoneCard}>
                  <span className={styles.milestonePercent}>60%</span>
                  <span className={styles.milestoneLabel}>Material Dispatch to Site</span>
                  <span className={styles.milestoneAmount}>
                    ₹{Math.round(quote.netCustomerCost * 0.6).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className={styles.milestoneCard}>
                  <span className={styles.milestonePercent}>20%</span>
                  <span className={styles.milestoneLabel}>Net-Metering & Testing</span>
                  <span className={styles.milestoneAmount}>
                    ₹{Math.round(quote.netCustomerCost * 0.2).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Terms & Special Notes */}
            {(quote.notes || quote.termsAndConditions) && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Terms & Scope of Work</h3>
                {quote.notes && (
                  <div>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      Special Notes:
                    </strong>
                    <p style={{ margin: '4px 0 12px', whiteSpace: 'pre-line' }}>{quote.notes}</p>
                  </div>
                )}
                {quote.termsAndConditions && (
                  <div>
                    <strong style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      Terms & Conditions:
                    </strong>
                    <p style={{ margin: '4px 0 0', whiteSpace: 'pre-line' }}>
                      {quote.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Customer Details & Financial Breakdown */}
          <div className={styles.rightCol}>
            {/* Financial Summary Card */}
            <div className={styles.summaryCard}>
              <h3 className={styles.cardTitle}>Financial Summary</h3>

              <div className={styles.summaryRow}>
                <span>Items Subtotal:</span>
                <span>₹{(quote.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Total GST:</span>
                <span>+ ₹{(quote.totalGst || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.summaryRow} style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                <span>Gross Total:</span>
                <span>₹{(quote.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>

              {quote.centralSubsidy > 0 && (
                <div className={`${styles.summaryRow} ${styles.subsidy}`}>
                  <span>Central Subsidy (MNRE):</span>
                  <span>- ₹{quote.centralSubsidy.toLocaleString('en-IN')}</span>
                </div>
              )}

              {quote.stateSubsidy > 0 && (
                <div className={`${styles.summaryRow} ${styles.subsidy}`}>
                  <span>State DISCOM Subsidy:</span>
                  <span>- ₹{quote.stateSubsidy.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className={styles.summaryDivider} />

              <div className={styles.netPayableCard}>
                <span className={styles.netPayableLabel}>Net Customer Payable</span>
                <span className={styles.netPayableAmount}>
                  ₹{(quote.netCustomerCost || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Customer & Site Details Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Customer & Site Details</h3>

              <div className={styles.customerFields}>
                <div className={styles.customerField}>
                  <span className={styles.customerLabel}>Customer Name</span>
                  <div className={styles.customerValue}>
                    {quote.lead?.customerName ? (
                      <Link
                        to={`/leads/${quote.leadId}`}
                        style={{ color: 'var(--color-primary-600)', textDecoration: 'none' }}
                      >
                        {quote.lead.customerName}
                      </Link>
                    ) : (
                      quote.leadId
                    )}
                  </div>
                </div>

                {quote.lead?.mobileNumber && (
                  <div className={styles.customerField}>
                    <span className={styles.customerLabel}>Mobile Number</span>
                    <div className={styles.customerValue}>
                      <span>{quote.lead.mobileNumber}</span>
                      <a
                        href={`https://wa.me/${quote.lead.mobileNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.waBtn}
                        title="Chat on WhatsApp"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {quote.lead?.email && (
                  <div className={styles.customerField}>
                    <span className={styles.customerLabel}>Email</span>
                    <div className={styles.customerValue}>{quote.lead.email}</div>
                  </div>
                )}

                {(quote.lead?.city || quote.lead?.state) && (
                  <div className={styles.customerField}>
                    <span className={styles.customerLabel}>Location</span>
                    <div className={styles.customerValue}>
                      {[quote.lead.city, quote.lead.state].filter(Boolean).join(', ')}
                    </div>
                  </div>
                )}

                {quote.lead?.address && (
                  <div className={styles.customerField}>
                    <span className={styles.customerLabel}>Installation Address</span>
                    <div className={styles.customerValue}>{quote.lead.address}</div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '8px' }}>
                <Link to={`/leads/${quote.leadId}`}>
                  <Button variant="outline" size="sm" fullWidth>
                    View Associated Lead
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default QuotationDetailPage;
