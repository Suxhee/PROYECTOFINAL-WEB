import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <main className="container py-5"><h1>Ocurrió un error</h1><p>Recarga la página o intenta más tarde.</p></main>;
    }
    return this.props.children;
  }
}
