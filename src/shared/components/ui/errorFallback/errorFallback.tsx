import { Button } from '@/shared/components/ui/button/button';

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ErrorFallback = ({
  title = 'Something went wrong!',
  message,
  error,
  onRetry,
  onGoHome,
}: ErrorFallbackProps) => {
  const description =
    message ||
    error?.message ||
    'An unexpected error occurred. Please try again.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="max-w-md w-full mx-4 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
          {title}
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">{description}</p>

        {import.meta.env.DEV && error?.stack && (
          <pre className="text-left text-xs text-[var(--color-text-secondary)] bg-black/5 rounded-md p-3 mb-6 overflow-auto max-h-48">
            {error.stack}
          </pre>
        )}

        <div className="flex flex-col gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="primary" size="lg">
              Try again
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome} variant="outline" size="lg">
              Go home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
