import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ fontSize: '10px', overflow: 'auto' }}>{this.state.error?.toString()}</pre>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ padding: '10px', marginTop: '20px', background: '#cc0000', color: 'white', border: 'none', borderRadius: '5px' }}>
            Clear Data & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);