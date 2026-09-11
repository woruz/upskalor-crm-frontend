import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ROUTES } from '@/shared/lib/config/routes';
import { ErrorFallback } from '@/shared/components/ui/errorFallback/errorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, info);
    } else {
      console.error('ErrorBoundary caught an error:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  handleGoHome = () => {
    window.location.href = ROUTES.HOME;
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}
