'use client';
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-zinc-500 mb-4">An unexpected error occurred</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2.5 bg-[#fb5607] text-white rounded-xl text-sm font-semibold hover:bg-[#e04e06] transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
