import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Button } from '@/shared/components/ui/button/button';
import { FileUpload } from '@/shared/components/ui/fileUpload/fileUpload';
import { Badge } from '@/shared/components/ui/badge/badge';
import { Spinner } from '@/shared/components/ui/spinner/spinner';
import { useToast } from '@/shared/components/ui/toast/toast';
import {
  getImportUploadUrl,
  uploadFileToS3,
  triggerImport,
  getImportStatus,
  getImportErrorReport,
} from '@/shared/lib/api/leadsApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import type { ImportJob } from '@/shared/lib/types';
import styles from './importLeadsModal.module.scss';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportLeadsModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportLeadsModalProps) {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null);
  const [isDownloadingError, setIsDownloadingError] = useState(false);
  const pollTimerRef = useRef<number | null>(null);

  // Clear timer on unmount
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
    setSelectedFile(null);
    setIsUploading(false);
    setActiveJob(null);
    onClose();
  };

  const handleStartImport = async () => {
    if (!selectedFile) {
      addToast({
        title: 'No file selected',
        description: 'Please choose a .csv or .xlsx file to import.',
        variant: 'warning',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Request presigned S3 upload URL
      const contentType =
        selectedFile.name.endsWith('.xlsx')
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv';

      const presigned = await getImportUploadUrl({
        fileName: selectedFile.name,
        contentType,
        fileSize: selectedFile.size,
      });

      // Step 2: Upload file directly to S3 via PUT
      await uploadFileToS3(presigned.uploadUrl, selectedFile);

      // Step 3: Trigger BullMQ background worker
      const importResponse = await triggerImport({
        fileId: presigned.fileId,
        key: presigned.key,
      });

      setActiveJob(importResponse.data);
      setIsUploading(false);

      addToast({
        title: 'Import Queued',
        description: 'Your file has been uploaded and queued for processing.',
        variant: 'info',
      });

      // Step 4: Start polling
      startPolling(importResponse.data.id);
    } catch (error) {
      setIsUploading(false);
      const message = extractApiError(error);
      addToast({
        title: 'Import Failed',
        description: message,
        variant: 'error',
      });
    }
  };

  const startPolling = (jobId: string) => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
    }

    pollTimerRef.current = window.setInterval(async () => {
      try {
        const response = await getImportStatus(jobId);
        const job = response.data;
        setActiveJob(job);

        if (
          job.status === 'COMPLETED' ||
          job.status === 'COMPLETED_WITH_ERRORS' ||
          job.status === 'FAILED'
        ) {
          if (pollTimerRef.current) {
            window.clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }

          if (job.status === 'COMPLETED') {
            addToast({
              title: 'Import Completed',
              description: `Successfully imported ${job.successfulRows} leads.`,
              variant: 'success',
            });
            onSuccess();
          } else if (job.status === 'COMPLETED_WITH_ERRORS') {
            addToast({
              title: 'Import Finished with Warnings',
              description: `Imported ${job.successfulRows} leads. ${job.failedRows} rows failed.`,
              variant: 'warning',
            });
            onSuccess();
          } else {
            addToast({
              title: 'Import Failed',
              description: 'The background worker encountered an error processing the file.',
              variant: 'error',
            });
          }
        }
      } catch (error) {
        // Continue polling or stop on critical error
      }
    }, 1500);
  };

  const handleDownloadErrorReport = async () => {
    if (!activeJob) return;
    setIsDownloadingError(true);
    try {
      const response = await getImportErrorReport(activeJob.id);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      const message = extractApiError(error);
      addToast({
        title: 'Download Failed',
        description: message,
        variant: 'error',
      });
    } finally {
      setIsDownloadingError(false);
    }
  };

  const isFinished =
    activeJob?.status === 'COMPLETED' ||
    activeJob?.status === 'COMPLETED_WITH_ERRORS' ||
    activeJob?.status === 'FAILED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      closeOnOverlayClick={!isUploading && !activeJob}
    >
      <Modal.Header
        title={activeJob ? 'Import Progress' : 'Import Leads'}
        onClose={handleClose}
      />

      <Modal.Content>
        <div className={styles.modalContent}>
          {!activeJob ? (
            <div className={styles.fileSection}>
              <FileUpload
                accept=".csv,.xlsx"
                multiple={false}
                maxSize={15 * 1024 * 1024}
                onFilesChange={(files) => setSelectedFile(files[0] || null)}
                label="Select CSV or Excel file"
                helperText="Upload .csv or .xlsx with customerName, mobileNumber, and followUpDate columns"
              />
              <p className={styles.hint}>
                Supported formats: <strong>.csv</strong>, <strong>.xlsx</strong>. Maximum file size: 15MB.
              </p>
            </div>
          ) : (
            <div className={styles.processingContainer}>
              {!isFinished ? (
                <>
                  <Spinner size="lg" />
                  <h4 className={styles.statusTitle}>
                    {activeJob.status === 'QUEUED'
                      ? 'Queued for processing…'
                      : 'Processing rows in background…'}
                  </h4>
                  <p className={styles.statusDesc}>
                    Please wait while the file is parsed and validated.
                  </p>
                </>
              ) : (
                <>
                  <h4 className={styles.statusTitle}>
                    {activeJob.status === 'COMPLETED' && 'Import Successful'}
                    {activeJob.status === 'COMPLETED_WITH_ERRORS' &&
                      'Completed with Errors'}
                    {activeJob.status === 'FAILED' && 'Import Failed'}
                  </h4>

                  <Badge
                    variant={
                      activeJob.status === 'COMPLETED'
                        ? 'success'
                        : activeJob.status === 'COMPLETED_WITH_ERRORS'
                          ? 'warning'
                          : 'error'
                    }
                    pill
                  >
                    {activeJob.status}
                  </Badge>

                  <div className={styles.metricsGrid}>
                    <div className={styles.metricCard}>
                      <span className={styles.metricValue}>
                        {activeJob.totalRows}
                      </span>
                      <span className={styles.metricLabel}>Total Rows</span>
                    </div>

                    <div className={styles.metricCard}>
                      <span
                        className={`${styles.metricValue} ${styles['metricValue--success']}`}
                      >
                        {activeJob.successfulRows}
                      </span>
                      <span className={styles.metricLabel}>Successful</span>
                    </div>

                    <div className={styles.metricCard}>
                      <span
                        className={`${styles.metricValue} ${styles['metricValue--failed']}`}
                      >
                        {activeJob.failedRows}
                      </span>
                      <span className={styles.metricLabel}>Failed</span>
                    </div>

                    <div className={styles.metricCard}>
                      <span
                        className={`${styles.metricValue} ${styles['metricValue--warning']}`}
                      >
                        {activeJob.duplicateRows}
                      </span>
                      <span className={styles.metricLabel}>Duplicates</span>
                    </div>
                  </div>

                  {activeJob.failedRows > 0 && (
                    <div className={styles.actionsRow}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadErrorReport}
                        isLoading={isDownloadingError}
                      >
                        Download Error Report (.csv)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Modal.Content>

      <Modal.Footer>
        {!activeJob ? (
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleStartImport}
              isLoading={isUploading}
              disabled={!selectedFile}
            >
              Upload & Import
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleClose}
            disabled={!isFinished}
          >
            {isFinished ? 'Done' : 'Processing...'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
