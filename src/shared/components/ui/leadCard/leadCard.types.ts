import React from 'react';

export interface LeadCardMetaItem {
  icon?: React.ReactNode;
  text: React.ReactNode;
}

export interface LeadStatusOption {
  label: string;
  value: string;
}

export interface LeadCardProps {
  /** Main title / lead name (e.g., "Fuzen") */
  title: string;

  /** Location string (e.g., "Mumbai, Mumbai, Jharkhand") */
  location?: string;

  /** Monthly bill / amount (e.g., "₹10,000 /mo") */
  monthlyAmount?: string;

  /** Custom metadata items displayed beside location/amount */
  metadata?: LeadCardMetaItem[];

  /** Current lead status (e.g., "New", "Contacted", etc.) */
  status?: string;

  /** Status options for dropdown selection */
  statusOptions?: (string | LeadStatusOption)[];

  /** Follow-up date (ISO string YYYY-MM-DD or display format) */
  followUpDate?: string;

  /** Label for the status dropdown field (default: "LEAD STATUS") */
  statusLabel?: string;

  /** Label for the follow-up date input (default: "FOLLOW-UP DATE") */
  followUpLabel?: string;

  /** Label for the edit button (default: "Edit") */
  editLabel?: string;

  /** Label for the quotation button (default: "Create Quotation") */
  quotationLabel?: string;

  /** Label for the save button (default: "Save") */
  saveLabel?: string;

  /** Whether to display the edit button (default: true) */
  showEdit?: boolean;

  /** Whether to display the quotation button (default: true) */
  showQuotation?: boolean;

  /** Whether to display the delete button (default: true) */
  showDelete?: boolean;

  /** Whether to display the bottom status/follow-up section (default: true) */
  showStatusSection?: boolean;

  /** Disables the save button and displays a saving state */
  isSaving?: boolean;

  /** Callback fired when Edit button is clicked */
  onEdit?: () => void;

  /** Callback fired when Create Quotation button is clicked */
  onCreateQuotation?: () => void;

  /** Callback fired when Delete button is clicked */
  onDelete?: () => void;

  /** Callback fired when status selection changes */
  onStatusChange?: (newStatus: string) => void;

  /** Callback fired when follow-up date input changes */
  onFollowUpDateChange?: (newDate: string) => void;

  /** Callback fired when Save button is clicked with current status and followUpDate */
  onSave?: (data: { status: string; followUpDate: string }) => void;

  /** Custom action elements to display on the top-right */
  customActions?: React.ReactNode;

  /** Optional children rendered below header or status section */
  children?: React.ReactNode;

  /** Additional CSS class name */
  className?: string;

  /** Inline CSS styles */
  style?: React.CSSProperties;
}
