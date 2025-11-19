'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Enhanced Error Boundary Component
 * 
 * Features:
 * - Catches React errors in child components
 * - Displays user-friendly error UI
 * - Allows error recovery with reset
 * - Reports errors to console/monitoring service
 * - Animated error display
 * - Automatic recovery attempts
 */
export class EnhancedErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Report to error monitoring service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // Auto-reset error boundary when reset keys change
    if (
      hasError &&
      resetKeys &&
      prevProps.resetKeys &&
      !resetKeys.every((key, index) => key === prevProps.resetKeys![index])
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: FallbackComponent } = this.props;

    if (hasError && error) {
      if (FallbackComponent) {
        return <FallbackComponent error={error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={error} resetError={this.resetError} />;
    }

    return children;
  }
}

/**
 * Default Error Fallback UI
 */
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);

  // Auto-retry mechanism
  React.useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      resetError();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, resetError]);

  const handleReset = () => {
    window.location.reload();
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  const startAutoRetry = () => {
    setCountdown(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-900/20 dark:via-dark-900 dark:to-orange-900/20 flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border-2 border-red-200 dark:border-red-800 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 3,
                }}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiAlertTriangle className="w-8 h-8 text-red-500" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white text-center mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-red-100 text-center">
                We encountered an unexpected error
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200 text-sm font-medium mb-2">
                  Error Message:
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm font-mono">
                  {error.message || 'Unknown error occurred'}
                </p>
              </div>

              {/* Error Details (Developer Mode) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline mb-2"
                  >
                    {showDetails ? 'Hide' : 'Show'} technical details
                  </button>
                  
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-64 text-xs font-mono"
                    >
                      <div className="whitespace-pre-wrap">
                        {error.stack}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Auto-retry countdown */}
              {countdown !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 text-center"
                >
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Auto-retrying in {countdown} seconds...
                  </p>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetError}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <FiRefreshCw className="w-5 h-5" />
                  Try Again
                </button>

                <button
                  onClick={handleHome}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-dark-600 transition-all duration-300"
                >
                  <FiHome className="w-5 h-5" />
                  Go Home
                </button>
              </div>

              {countdown === null && (
                <button
                  onClick={startAutoRetry}
                  className="w-full mt-3 px-6 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Enable auto-retry (5s)
                </button>
              )}

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  If this problem persists, please{' '}
                  <a
                    href="/contact"
                    className="text-primary hover:underline font-medium"
                  >
                    contact support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Async Error Boundary for handling async errors
 */
export function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason));
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (error) {
    return <DefaultErrorFallback error={error} resetError={() => setError(null)} />;
  }

  return <>{children}</>;
}

/**
 * Network Error Boundary for API failures
 */
export function NetworkErrorBoundary({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Internet Connection
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please check your internet connection and try again
          </p>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

export default EnhancedErrorBoundary;
