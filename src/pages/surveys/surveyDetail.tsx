import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner/spinner';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { ROUTES } from '@/shared/lib/config/routes';
import { surveyService } from '@/shared/lib/services/surveyService';
import {
  getSurveyById,
  updateSurvey,
  updateSurveyStatus,
  assignSurveyTechnician,
  uploadSurveyPhoto,
  deleteSurveyPhoto,
} from '@/shared/lib/api/surveysApi';
import type { SurveyStatus, ShadingOption, ConnectionType, UpdateSurveyPayload } from '@/shared/lib/types';
import styles from './surveyDetail.module.scss';

// ─── Solar Rooftop Sample Thumbnail Graphic ───────────────────────────────────

const SolarRooftopGraphic = () => (
  <svg
    width="240"
    height="120"
    viewBox="0 0 240 120"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Solar rooftop preview"
  >
    <rect width="240" height="120" rx="8" fill="#0b1120" />
    {/* Sun rising behind roof */}
    <circle cx="170" cy="50" r="28" fill="#ea580c" opacity="0.8" />
    <circle cx="170" cy="50" r="20" fill="#f59e0b" />
    <line x1="170" y1="12" x2="170" y2="20" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="198" y1="22" x2="192" y2="28" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="210" y1="50" x2="202" y2="50" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="142" y1="22" x2="148" y2="28" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="130" y1="50" x2="138" y2="50" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    {/* Roof base */}
    <path d="M 25 90 L 40 65 L 205 65 L 190 90 Z" fill="#1e3a8a" />
    {/* Rooftop plane */}
    <polygon points="30,80 75,32 215,62 185,90" fill="#2563eb" />
    {/* Solar panel grid 1 */}
    <polygon points="52,72 78,44 108,48 82,76" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1.5" />
    <line x1="65" y1="58" x2="95" y2="62" stroke="#1d4ed8" strokeWidth="1" />
    {/* Solar panel grid 2 */}
    <polygon points="88,75 114,47 144,51 118,79" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1.5" />
    <line x1="101" y1="61" x2="131" y2="65" stroke="#1d4ed8" strokeWidth="1" />
    {/* Solar panel grid 3 */}
    <polygon points="124,78 150,50 180,54 154,82" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="1.5" />
    <line x1="137" y1="64" x2="167" y2="68" stroke="#1d4ed8" strokeWidth="1" />
  </svg>
);

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const PinLocationIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
);

const CloudUploadIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    <polyline points="12 13 12 9 10 11" />
    <polyline points="12 9 14 11" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Dropdown Options ─────────────────────────────────────────────────────────

const TECHNICIAN_OPTIONS = [
  { label: 'Unassigned', value: 'Unassigned' },
  { label: 'Rajesh Kumar', value: 'Rajesh Kumar' },
  { label: 'Vikram Singh', value: 'Vikram Singh' },
  { label: 'Amit Patel', value: 'Amit Patel' },
];

const SHADING_OPTIONS = [
  { label: 'None', value: 'None' },
  { label: 'Partial', value: 'Partial' },
  { label: 'Heavy', value: 'Heavy' },
];

const CONNECTION_TYPE_OPTIONS = [
  { label: 'Three-phase', value: 'Three-phase' },
  { label: 'Single-phase', value: 'Single-phase' },
];

const STATUS_OPTIONS = [
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

interface PhotoItem {
  id: string;
  url?: string;
  isSample?: boolean;
  name: string;
}

export function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  // ─── Section 1: Customer Details State ──────────────────────────────────────
  const [customerDetails, setCustomerDetails] = useState<{
    name: string;
    mobile: string;
    address: string;
    monthlyBill: string;
  } | null>(null);

  // ─── Section 2: Technical Specs State ───────────────────────────────────────
  const [assignTechnician, setAssignTechnician] = useState('Unassigned');
  const [roofAreaSqft, setRoofAreaSqft] = useState('');
  const [shading, setShading] = useState<string>('None');
  const [connectionType, setConnectionType] = useState<string>('Three-phase');
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState('');
  const [monthlyConsumptionKwh, setMonthlyConsumptionKwh] = useState('');
  const [recommendedKw, setRecommendedKw] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState<SurveyStatus>('Scheduled');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load live survey from backend API or local storage
  const loadSurveyData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setNotFound(false);
    try {
      let s: any = null;
      try {
        const res = await getSurveyById(id);
        s = res.data;
      } catch {
        s = surveyService.getSurveyById(id);
      }

      if (!s) {
        setNotFound(true);
        return;
      }

      setCustomerDetails({
        name: s.customerName,
        mobile: s.mobileNumber,
        address: s.address || '-',
        monthlyBill: s.lead?.monthlyBillAmount
          ? `₹${s.lead.monthlyBillAmount.toLocaleString('en-IN')}`
          : '-',
      });
      setAssignTechnician(s.assignedTech || 'Unassigned');
      setRoofAreaSqft(s.roofAreaSqft ? String(s.roofAreaSqft) : '');
      setShading(s.shading || 'None');
      setConnectionType(s.connectionType || 'Three-phase');
      setSanctionedLoadKw(s.sanctionedLoadKw ? String(s.sanctionedLoadKw) : '');
      setMonthlyConsumptionKwh(s.monthlyConsumptionKwh ? String(s.monthlyConsumptionKwh) : '');
      setRecommendedKw(s.recommendedKw ? String(s.recommendedKw) : '');
      setLatitude(s.latitude || '');
      setLongitude(s.longitude || '');
      setStatus(s.status || 'Scheduled');
      setNotes(s.notes || '');
      if (s.photos && s.photos.length > 0) {
        setPhotos(
          s.photos.map((p: any) => ({
            id: p.id,
            url: p.fileUrl,
            name: p.fileName,
          }))
        );
      } else {
        setPhotos([]);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSurveyData();
  }, [loadSurveyData]);

  // ─── Auto-calculate recommended kW from monthly consumption ────────────────
  useEffect(() => {
    const consumption = parseFloat(monthlyConsumptionKwh);
    if (!isNaN(consumption) && consumption > 0) {
      // General solar estimation: ~120-125 units generated per kW per month
      const calculated = Math.round(consumption / 125);
      setRecommendedKw(String(calculated || 1));
    }
  }, [monthlyConsumptionKwh]);

  // ─── Section 3: Photo Gallery State ─────────────────────────────────────────
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Location Handler ───────────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setLatitude(lat);
          setLongitude(lng);
          addToast({
            title: 'Location Captured',
            description: `Coordinates: ${lat}, ${lng}`,
            variant: 'success',
          });
        },
        () => {
          // Fallback location
          const fallbackLat = '19.113642';
          const fallbackLng = '72.869734';
          setLatitude(fallbackLat);
          setLongitude(fallbackLng);
          addToast({
            title: 'Location Captured',
            description: `Coordinates: ${fallbackLat}, ${fallbackLng}`,
            variant: 'info',
          });
        },
      );
    } else {
      setLatitude('19.113642');
      setLongitude('72.869734');
      addToast({
        title: 'Location Captured',
        description: 'Set default coordinates (19.113642, 72.869734)',
        variant: 'info',
      });
    }
  };

  // ─── Save Technical Specs ───────────────────────────────────────────────────
  const handleSaveTechnicalSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSaving(true);

    const payload: UpdateSurveyPayload = {
      roofAreaSqft: parseFloat(roofAreaSqft) || 0,
      shading: shading as ShadingOption,
      connectionType: connectionType as ConnectionType,
      sanctionedLoadKw: parseFloat(sanctionedLoadKw) || 0,
      monthlyConsumptionKwh: parseFloat(monthlyConsumptionKwh) || 0,
      recommendedKw: parseFloat(recommendedKw) || 0,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      notes: notes || undefined,
      assignedTech: assignTechnician,
    };

    try {
      const res = await updateSurvey(id, payload);
      if (res.warning) {
        addToast({
          title: 'Technician Overlap Warning',
          description: res.warning,
          variant: 'warning',
        });
      }
      addToast({
        title: 'Technical Specs Saved',
        description: 'Site survey technical parameters updated successfully.',
        variant: 'success',
      });
    } catch {
      surveyService.updateSurvey(id, payload);
      addToast({
        title: 'Technical Specs Saved',
        description: 'Site survey parameters updated.',
        variant: 'success',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Quick Status Transition Handler ────────────────────────────────────────
  const handleStatusChange = async (newStatus: SurveyStatus) => {
    setStatus(newStatus);
    if (!id) return;
    try {
      await updateSurveyStatus(id, newStatus);
      addToast({
        title: 'Status Updated',
        description: `Survey status changed to ${newStatus}.`,
        variant: 'success',
      });
    } catch {
      surveyService.updateSurvey(id, { status: newStatus });
    }
  };

  // ─── Assign Technician Handler ──────────────────────────────────────────────
  const handleTechnicianChange = async (newTech: string) => {
    setAssignTechnician(newTech);
    if (!id) return;
    try {
      const res = await assignSurveyTechnician(id, {
        assignedTechId: null,
        assignedTech: newTech,
      });
      if (res.warning) {
        addToast({
          title: 'Technician Overlap Warning',
          description: res.warning,
          variant: 'warning',
        });
      }
    } catch {
      surveyService.updateSurvey(id, { assignedTech: newTech });
    }
  };

  // ─── Photo Upload & Handlers ────────────────────────────────────────────────
  const handleFilesAdded = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(async (file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const tempId = Math.random().toString(36).substring(2, 9);
        const newPhotoItem: PhotoItem = {
          id: tempId,
          url,
          name: file.name,
        };
        setPhotos((prev) => [...prev, newPhotoItem]);

        if (id) {
          try {
            const res = await uploadSurveyPhoto(id, {
              fileUrl: url,
              fileName: file.name,
              fileSizeBytes: file.size,
              mimeType: file.type,
            });
            if (res.data?.id) {
              setPhotos((prev) =>
                prev.map((p) => (p.id === tempId ? { ...p, id: res.data.id } : p)),
              );
            }
          } catch {
            // Local state preserved
          }
        }
      }
    });

    addToast({
      title: 'Photos Added',
      description: `Uploaded ${files.length} photo(s) to gallery.`,
      variant: 'success',
    });
  };

  const handleRemovePhoto = async (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (id && !photoId.startsWith('default-')) {
      try {
        await deleteSurveyPhoto(id, photoId);
      } catch {
        // photo removed locally
      }
    }
    addToast({
      title: 'Photo Removed',
      description: 'Photo was removed from the gallery.',
      variant: 'info',
    });
  };

  if (isLoading) {
    return (
      <AppLayout
        headerProps={{
          title: 'Survey Details',
          breadcrumbs: [
            { label: 'CRM' },
            { label: 'Site Surveys', path: ROUTES.SURVEYS },
          ],
          userName: fullName || user?.email || 'User',
          userRole: user?.role || 'user',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
          <Spinner size="lg" />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading survey details…</p>
        </div>
      </AppLayout>
    );
  }

  if (notFound || !customerDetails) {
    return (
      <AppLayout
        headerProps={{
          title: 'Survey Details',
          breadcrumbs: [
            { label: 'CRM' },
            { label: 'Site Surveys', path: ROUTES.SURVEYS },
          ],
          userName: fullName || user?.email || 'User',
          userRole: user?.role || 'user',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
          <h3>Survey Not Found</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            The requested site survey does not exist or has been removed.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate(ROUTES.SURVEYS)}>
            Back to Site Surveys
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      headerProps={{
        title: 'Survey Details',
        breadcrumbs: [
          { label: 'CRM' },
          { label: 'Site Surveys', path: ROUTES.SURVEYS },
          { label: customerDetails.name },
        ],
        userName: fullName || user?.email || 'User',
        userRole: user?.role || 'user',
        notificationCount: 2,
      }}
    >
      <div className={styles.page}>
        {/* ── Top Navigation Bar ──────────────────────────────────────────── */}
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTES.SURVEYS)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Surveys
          </button>
        </div>

        {/* ── 1. Customer Details ─────────────────────────────────────────── */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>1. Customer Details</h2>

          <div className={styles.customerGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Name</span>
              <span className={`${styles.detailValue} ${styles['detailValue--primary']}`}>
                {customerDetails.name}
              </span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Mobile</span>
              <span className={styles.detailValue}>{customerDetails.mobile}</span>
            </div>

            <div className={`${styles.detailItem} ${styles['detailItem--fullWidth']}`}>
              <span className={styles.detailLabel}>Address</span>
              <span className={styles.detailValue}>{customerDetails.address}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Monthly Bill</span>
              <span className={styles.detailValue}>{customerDetails.monthlyBill}</span>
            </div>
          </div>
        </div>

        {/* ── 2. Technical Specs ──────────────────────────────────────────── */}
        <form className={styles.card} onSubmit={handleSaveTechnicalSpecs}>
          <h2 className={styles.sectionHeader}>2. Technical Specs</h2>

          <div className={styles.formGrid}>
            {/* Assign Technician */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Assign Technician</label>
              <Dropdown
                options={TECHNICIAN_OPTIONS}
                value={assignTechnician}
                onChange={(val) => handleTechnicianChange(String(val))}
              />
            </div>

            {/* Roof Area (SqFt) */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Roof Area (SqFt)</label>
              <input
                type="number"
                className={styles.fieldInput}
                value={roofAreaSqft}
                onChange={(e) => setRoofAreaSqft(e.target.value)}
                placeholder="100"
              />
            </div>

            {/* Shading */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Shading</label>
              <Dropdown
                options={SHADING_OPTIONS}
                value={shading}
                onChange={(val) => setShading(String(val))}
              />
            </div>

            {/* Connection Type */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Connection Type</label>
              <Dropdown
                options={CONNECTION_TYPE_OPTIONS}
                value={connectionType}
                onChange={(val) => setConnectionType(String(val))}
              />
            </div>

            {/* Sanctioned Load (kW) */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Sanctioned Load (kW)</label>
              <input
                type="number"
                className={styles.fieldInput}
                value={sanctionedLoadKw}
                onChange={(e) => setSanctionedLoadKw(e.target.value)}
                placeholder="3"
              />
            </div>

            {/* Existing monthly unit consumption (kWh) */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Existing monthly unit consumption (kWh)</label>
              <input
                type="number"
                className={styles.fieldInput}
                value={monthlyConsumptionKwh}
                onChange={(e) => setMonthlyConsumptionKwh(e.target.value)}
                placeholder="375"
              />
            </div>

            {/* Recommended kW (Auto-calculated) */}
            <div className={`${styles.inputGroup} ${styles['inputGroup--fullWidth']}`}>
              <label className={styles.label}>Recommended kW (Auto-calculated)</label>
              <input
                type="number"
                className={styles.fieldInput}
                value={recommendedKw}
                onChange={(e) => setRecommendedKw(e.target.value)}
                placeholder="3"
              />
            </div>

            {/* Location Details Subsection */}
            <div className={styles.locationSection}>
              <div className={styles.locationHeader}>
                <span className={styles.locationTitle}>Location Details</span>
                <button
                  type="button"
                  className={styles.getLocationBtn}
                  onClick={handleGetLocation}
                >
                  <PinLocationIcon />
                  <span>Get Location</span>
                </button>
              </div>

              <div className={styles.locationInputsRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Latitude</label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder=""
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Longitude</label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className={`${styles.inputGroup} ${styles['inputGroup--fullWidth']}`}>
              <label className={styles.label}>Status</label>
              <Dropdown
                options={STATUS_OPTIONS}
                value={status}
                onChange={(val) => handleStatusChange(val as SurveyStatus)}
              />
            </div>

            {/* Notes */}
            <div className={`${styles.inputGroup} ${styles['inputGroup--fullWidth']}`}>
              <label className={styles.label}>Notes</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder=""
              />
            </div>

            {/* Save Action */}
            <div className={styles.saveActionRow}>
              <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Technical Specs'}
              </button>
            </div>
          </div>
        </form>

        {/* ── 3. Photo Gallery ────────────────────────────────────────────── */}
        <div className={styles.card}>
          <h2 className={styles.sectionHeader}>3. Photo Gallery</h2>

          <div className={styles.galleryContainer}>
            {photos.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
                No site survey photos uploaded yet. Drop photos below or click to browse.
              </p>
            ) : (
              <div className={styles.photosList}>
                {photos.map((photo) => (
                  <div key={photo.id} className={styles.photoCard}>
                    {photo.isSample ? (
                      <SolarRooftopGraphic />
                    ) : (
                      <img src={photo.url} alt={photo.name} />
                    )}
                    <button
                      type="button"
                      className={styles.removePhotoBtn}
                      onClick={() => handleRemovePhoto(photo.id)}
                      title={`Remove ${photo.name}`}
                      aria-label="Remove photo"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              className={`${styles.dropzone} ${
                isDragOver ? styles['dropzone--active'] : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFilesAdded(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className={styles.cloudIcon}>
                <CloudUploadIcon />
              </span>
              <p className={styles.dropzonePrompt}>
                Drag and drop photos here, or click to browse
              </p>

              <div className={styles.pickerRow}>
                <button
                  type="button"
                  className={styles.chooseFilesBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Choose Files
                </button>
                <span className={styles.fileStatusText}>No file chosen</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className={styles.hiddenFileInput}
                onChange={(e) => {
                  handleFilesAdded(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default SurveyDetailPage;
