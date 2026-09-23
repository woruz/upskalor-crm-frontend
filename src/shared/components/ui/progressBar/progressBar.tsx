import React from 'react';
import styles from './progressBar.module.scss';

export interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number | string;
  color?: string;
  trackColor?: string;
  className?: string;
  ariaLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 10,
  height = 8,
  color,
  trackColor,
  className = '',
  ariaLabel = 'Progress',
}) => {
  const safeMax = max > 0 ? max : 1;
  const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100);

  return (
    <div
      className={`${styles.progressTrack} ${className}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        ...(trackColor ? { backgroundColor: trackColor } : {}),
      }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      <div
        className={styles.progressBar}
        style={{
          width: `${percentage}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
};

export default ProgressBar;
