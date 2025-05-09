"use client";

import { Component, ReactNode } from "react";
import ErrorComponent from "@/app/error"; // Ajusta la ruta según donde tengas tu componente error.tsx

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Actualizar el estado para mostrar la UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Puedes registrar el error en un servicio de reporte
    console.error("Error capturado por ErrorBoundary:", {
      error,
      componentStack: errorInfo.componentStack,
      message: error.message
    });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Usa el componente de error personalizado
      return (
        <ErrorComponent 
          error={this.state.error} 
          reset={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}