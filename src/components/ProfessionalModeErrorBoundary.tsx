'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { FiAlertCircle, FiRefreshCw, FiHome } from 'react-icons/fi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for Professional Mode
 * Catches any errors in professional mode and shows a graceful fallback
 * Prevents the entire app from crashing
 */
export default class ProfessionalModeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Professional Mode Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Reload the page to reset state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <FiAlertCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-white/70 font-lato text-lg mb-8">
              We encountered an unexpected error in Professional Mode. Don't worry, your data is safe.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left overflow-auto max-h-40">
                <p className="text-red-400 font-mono text-xs sm:text-sm break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-red-300 text-xs cursor-pointer hover:underline">
                      Stack Trace
                    </summary>
                    <pre className="text-red-400 font-mono text-xs mt-2 whitespace-pre-wrap break-all">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#d4af37] text-white font-lato text-sm uppercase tracking-[0.2em] hover:bg-[#c19d2f] transition-all duration-300 rounded-lg"
              >
                <FiRefreshCw className="w-5 h-5" />
                Try Again
              </button>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-lato text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-gray-900 transition-all duration-300 rounded-lg"
              >
                <FiHome className="w-5 h-5" />
                Go to Home
              </Link>
            </div>

            {/* Help Text */}
            <p className="mt-8 text-white/50 font-lato text-sm">
              If this problem persists, please{' '}
              <Link href="/contact" className="text-[#d4af37] hover:underline">
                contact support
              </Link>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
