// src/utils/ErrorBoundary.js
import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, info) {
    // Log the error to an error tracking service like Sentry
    console.error("Error caught:", error);
    // You can log this to your backend logger here too
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong: {this.state.errorMessage}</h1>
          <p>Try going back to the <Link to="/">home page</Link>.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
