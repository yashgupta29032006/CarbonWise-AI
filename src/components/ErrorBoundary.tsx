"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Button from "./ui/Button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside CarbonWise AI:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 text-center">
          <div className="glass-card max-w-md p-8 space-y-6 border-red-500/10">
            <div className="bg-red-500/10 text-red-600 p-4 rounded-full inline-block">
              <AlertTriangle className="h-10 w-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Something went wrong</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                An unexpected error occurred. Please click below to reset the application state and try again.
              </p>
            </div>
            {this.state.error && (
              <pre className="p-3 bg-zinc-100 dark:bg-zinc-900 text-[10px] text-left text-red-500 dark:text-red-400 rounded-lg overflow-x-auto max-h-24">
                {this.state.error.message}
              </pre>
            )}
            <Button
              fullWidth
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
            >
              Reset Platform
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
