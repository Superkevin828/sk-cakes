import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-6 text-center gap-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-slate-400 max-w-md">
            We hit an unexpected error loading this page. Please refresh, or try again in a moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
