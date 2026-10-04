import { Component } from 'react';

/**
 * Keeps one broken Desk screen from blanking the whole page: the error is
 * shown with a way back, and logged to the console.
 */
export default class DeskErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Desk screen crashed:', error, info?.componentStack);
  }

  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="desk-col" style={{ borderRight: 'none' }}>
        <p className="t-label">This Desk screen hit an error</p>
        <p className="t-meta" style={{ margin: 'var(--s2) 0 var(--s4)' }}>{String(this.state.error?.message || this.state.error)}</p>
        <button className="btn btn-primary btn-sm" onClick={() => this.setState({ error: null })}>Try again</button>
      </div>
    );
  }
}
