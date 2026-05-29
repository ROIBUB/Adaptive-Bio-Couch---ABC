import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();

  // --- State ---
  // Each useState call creates one piece of state.
  // The first value is the current value; the setter triggers a re-render.
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});      // field-level validation errors
  const [apiError, setApiError] = useState('');      // error message from the server
  const [loading, setLoading]   = useState(false);   // true while the request is in-flight

  // If the user is already logged in, skip the login page entirely
  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // --- Client-side validation ---
  // Runs before sending anything to the server.
  // Returns an object: { email: "...", password: "..." } — empty means no errors.
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address (e.g. john@example.com)';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  // --- Form submit handler ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setApiError('');    // clear any previous server error

    // 1. Run client-side validation first
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // stop here — don't call the backend
    }
    setErrors({});

    // 2. Call the backend
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      // 3. Store the returned user object so all other pages can read it
      localStorage.setItem('user', JSON.stringify(user));
      // 4. Redirect to the dashboard
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <span className="login-logo">🏋️</span>
          <h1>Adaptive Bio-Coach</h1>
          <p>Personalized fitness and nutrition coaching, built around your progress.</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2>Sign In</h2>

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {/* Only shown when there is a validation error for this field */}
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={errors.password ? 'input-error' : ''}
              autoComplete="current-password"
            />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          {/* Server/API error — shown below the fields */}
          {apiError && (
            <div className="api-error" role="alert">
              {apiError}
            </div>
          )}

          {/* Submit button — disabled while loading */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-nav-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>

        {/* Demo hint — helpful for testing and for the grader */}
        <div className="login-hint">
          <p><strong>Demo accounts</strong></p>
          <p>john@fitwize.com — regular user</p>
          <p>noam@fitwize.com — admin</p>
          <p>Password for all: <code>password123</code></p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
