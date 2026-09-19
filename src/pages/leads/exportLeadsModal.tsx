import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Button } from '@/shared/components/ui/button/button';
import { Spinner } from '@/shared/components/ui/spinner/spinner';
import { useToast } from '@/shared/components/ui/toast/toast';
import {
  initiateExport,
  getExportStatus,
  getExportDownloadUrl,
} from '@/shared/lib/api/leadsApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import type { LeadFilters } from '@/shared/lib/types';
import styles from './exportLeadsModal.module.scss';

interface ExportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: LeadFilters;
  totalLeadsCount?: number;
}

export function ExportLeadsModal({
  isOpen,
  onClose,
  currentFilters,
  totalLeadsCount = 0,
}: ExportLeadsModalProps) {
  const { addToast } = useToast();
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const pollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsExporting(false);
    setStatusText('');
    onClose();
  };

  const handleStartExport = async () => {
    setIsExporting(true);
    setStatusText('Queuing export job…');

    try {
      // Step 1: Initiate background export job
      const response = await initiateExport({
        format,
        search: currentFilters?.search || undefined,
        status: currentFilters?.status || undefined,
        state: currentFilters?.state || undefined,
        city: currentFilters?.city || undefined,
        assignedExecutive: currentFilters?.assignedExecutive || undefined,
        sort: currentFilters?.sort || undefined,
        direction: currentFilters?.direction || undefined,
      });

      const exportId = response.data.id;
      setStatusText('Processing export in background…');

      // Step 2: Poll export status
      pollTimerRef.current = window.setInterval(async () => {
        try {
          const statusRes = await getExportStatus(exportId);
          const job = statusRes.data;

          if (job.status === 'COMPLETED') {
            if (pollTimerRef.current) {
              window.clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
            }

            setStatusText('Preparing download link…');
            // Step 3: Fetch download URL
            const downloadRes = await getExportDownloadUrl(exportId);
            if (downloadRes.data.downloadUrl) {
              window.open(downloadRes.data.downloadUrl, '_blank');
            }

            addToast({
              title: 'Export Complete',
              description: `Exported ${job.totalRows ?? 'all'} leads. Download started!`,
              variant: 'success',
            });

            handleClose();
          } else if (job.status === 'FAILED') {
            if (pollTimerRef.current) {
              window.clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
            }
            setIsExporting(false);
            addToast({
              title: 'Export Failed',
              description: 'The background export process failed. Please try again.',
              variant: 'error',
            });
          }
        } catch (pollErr) {
          // Continue polling
        }
      }, 1500);
    } catch (error) {
      setIsExporting(false);
      const message = extractApiError(error);
      addToast({
        title: 'Export Request Failed',
        description: message,
        variant: 'error',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      closeOnOverlayClick={!isExporting}
    >
      <Modal.Header title="Export Leads" onClose={handleClose} />

      <Modal.Content>
        <div className={styles.content}>
          {!isExporting ? (
            <>
              <div className={styles.formatGroup}>
                <span className={styles.label}>Select File Format</span>
                <div className={styles.formatOptions}>
                  <div
                    className={`${styles.formatCard} ${format === 'csv' ? styles['formatCard--active'] : ''}`}
                    onClick={() => setFormat('csv')}
                  >
                    <div className={styles.formatText}>
                      <span className={styles.formatTitle}>CSV</span>
                      <span className={styles.formatSubtitle}>
                        Comma-separated (.csv)
                      </span>
                    </div>
                  </div>

                  <div
                    className={`${styles.formatCard} ${format === 'xlsx' ? styles['formatCard--active'] : ''}`}
                    onClick={() => setFormat('xlsx')}
                  >
                    <div className={styles.formatText}>
                      <span className={styles.formatTitle}>Excel</span>
                      <span className={styles.formatSubtitle}>
                        Spreadsheet (.xlsx)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.filterSummary}>
                <strong>Export Scope:</strong>
                <div>
                  {totalLeadsCount > 0 ? `${totalLeadsCount} total matching leads. ` : ''}
                  Active filters will be applied (Search:{' '}
                  {currentFilters?.search || 'None'}, Status:{' '}
                  {currentFilters?.status || 'All'}, State:{' '}
                  {currentFilters?.state || 'All'}).
                </div>
              </div>
            </>
          ) : (
            <div className={styles.loadingState}>
              <Spinner size="lg" />
              <h4 className={styles.loadingTitle}>{statusText}</h4>
              <p className={styles.loadingDesc}>
                Generating your {format.toUpperCase()} export file. Your download will start automatically.
              </p>
            </div>
          )}
        </div>
      </Modal.Content>

      <Modal.Footer>
        <Button
          variant="secondary"
          size="md"
          onClick={handleClose}
          disabled={isExporting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleStartExport}
          isLoading={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export Leads'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
