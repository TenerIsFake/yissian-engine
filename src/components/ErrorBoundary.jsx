import React from 'react';

// Prevents complete dashboard unmount on uncaught React render errors.
// Without this, any undefined component or bad API response produces a blank screen.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Dashboard render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F1117',
          color: '#fff',
          fontFamily: 'monospace',
          padding: '40px 20px',
        }}>
          <div style={{ fontSize: 14, color: '#ef4444', marginBottom: 12, letterSpacing: '0.2em' }}>
            DASHBOARD_ERROR
          </div>
          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.80)',
            marginBottom: 24,
            maxWidth: 520,
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            {this.state.error?.message || 'An unexpected render error occurred.'}
          </p>
          {import.meta.env.DEV && this.state.errorInfo && (
            <details style={{ fontSize: 11, color: '#888', marginBottom: 24, maxWidth: 600 }}>
              <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Stack trace (dev only)</summary>
              <pre style={{ overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              background: '#3B82F6',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
            }}>
            RELOAD_DASHBOARD
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
