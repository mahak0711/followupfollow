// components/ErrorBoundary.js

import React, { Component } from 'react';

// Fallback component to display when an error occurs
const FallbackComponent = () => (
  <div className="error-message">
    <h2>Something went wrong!</h2>
    <p>We are working on it. Please try again later.</p>
  </div>
);

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackComponent />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
