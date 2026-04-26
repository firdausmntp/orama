"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary — catches rendering errors in child components
 * and displays a user-friendly fallback UI instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 gap-4 bg-bone neo-border" role="alert">
          <div className="flex items-center gap-3 text-orange-neon">
            <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            <h2 className="text-xl font-black uppercase tracking-wider">
              Something went wrong
            </h2>
          </div>
          <p className="text-charcoal/70 font-mono text-sm text-center max-w-md">
            {this.state.error?.message || "An unexpected error occurred while processing."}
          </p>
          <button
            onClick={this.handleReset}
            className="neo-btn bg-teal-dark text-bone px-6 py-2 font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
