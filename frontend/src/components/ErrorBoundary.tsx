import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary — catches React rendering errors
 * and prevents the entire app from crashing.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in dev, send to Sentry in production
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);

    // TODO: Send to Sentry when configured
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    // }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            fontFamily: "Inter, system-ui, sans-serif",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#e2e8f0",
          }}
        >
          <div
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              backdropFilter: "blur(20px)",
              borderRadius: "1rem",
              padding: "3rem",
              maxWidth: "500px",
              textAlign: "center",
              border: "1px solid rgba(148, 163, 184, 0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                color: "#f8fafc",
              }}
            >
              Une erreur est survenue
            </h1>
            <p
              style={{
                color: "#94a3b8",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              L'application a rencontré une erreur inattendue. Veuillez
              rafraîchir la page pour continuer.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#fca5a5",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.75rem",
                  textAlign: "left",
                  overflow: "auto",
                  maxHeight: "200px",
                  marginBottom: "1.5rem",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {this.state.error.message}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "white",
                border: "none",
                padding: "0.75rem 2rem",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(37, 99, 235, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(37, 99, 235, 0.3)";
              }}
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
