import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, updateSettings } from '../services/settingsService';
import './SettingsPage.css';

function SettingsPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    displayName: '',
    email:       '',
    theme:       'light',
  });

  const [formErrors, setFormErrors] = useState({});  // field-level errors
  const [loading,    setLoading]    = useState(true); // true while fetching current settings
  const [saving,     setSaving]     = useState(false);// true while the PUT is in-flight
  const [apiError,   setApiError]   = useState('');   // error from the server
  const [success,    setSuccess]    = useState('');   // success message after save

  // Load the current settings when the page first opens
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getSettings();
        const savedTheme = localStorage.getItem('theme'); // check localStorage first
        const theme = savedTheme || data.theme || 'light';
        setForm({
          displayName: data.displayName || '',
          email:       data.email       || '',
          theme,
        });
        document.body.classList.toggle('dark-mode', theme === 'dark');
      } catch (err) {
        setApiError('Could not load settings. Make sure the backend is running on port 3000.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // One handler for all fields — `name` on the input tells us which key to update
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSuccess('');
    // Immediately preview dark/light mode when theme changes
    if (name === 'theme') {
      document.body.classList.toggle('dark-mode', value === 'dark');
    }
  };

  // Client-side validation for required fields
  const validate = () => {
    const errs = {};
    if (!form.displayName.trim()) {
      errs.displayName = 'Display name is required';
    }
    if (!form.theme) {
      errs.theme = 'Theme is required';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    setSaving(true);
    try {
      await updateSettings(form);
      localStorage.setItem('theme', form.theme);
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setApiError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (
    `${(storedUser.firstName || '')[0] || ''}${(storedUser.lastName || '')[0] || ''}`.toUpperCase() || '?'
  );

  return (
    <div className="settings-page">
      <div className="settings-avatar">
        <div className="settings-avatar-circle">{initials}</div>
        <div>
          <div className="settings-avatar-name">{storedUser.firstName} {storedUser.lastName}</div>
          <div className="settings-avatar-role">{storedUser.userRole}</div>
        </div>
      </div>

      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your profile and preferences</p>
      </div>

      {/* Loading state while GET /api/settings is in-flight */}
      {loading && <p className="loading">Loading settings…</p>}

      {!loading && (
        <>
        <form className="settings-form" onSubmit={handleSubmit} noValidate>

          {/* ── Required field 1: Display Name ── */}
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={form.displayName}
              onChange={handleChange}
              placeholder="Your full name"
              className={formErrors.displayName ? 'input-error' : ''}
            />
            {formErrors.displayName && (
              <span className="error-msg">{formErrors.displayName}</span>
            )}
          </div>

          {/* ── Display-only: Email ── */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              readOnly
              className="input-readonly"
            />
          </div>

          {/* ── Required field 3: Theme preference ── */}
          <div className="form-group">
            <label htmlFor="theme">Theme Preference</label>
            <select
              id="theme"
              name="theme"
              value={form.theme}
              onChange={handleChange}
              className={formErrors.theme ? 'input-error' : ''}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            {formErrors.theme && (
              <span className="error-msg">{formErrors.theme}</span>
            )}
          </div>

          {/* Server error */}
          {apiError && <div className="api-error">{apiError}</div>}

          {/* Success message */}
          {success && <div className="success-msg">{success}</div>}

          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>

        {/* ── Fitness Plan ── */}
        <div className="replan-section">
          <h2 className="replan-title">Fitness Plan</h2>
          <p className="replan-desc">
            Want to switch goals or adjust your training intensity? Generate a fresh
            workout and meal plan based on updated preferences.
          </p>
          <button
            className="replan-btn"
            onClick={() => navigate('/onboarding?mode=replan')}
          >
            Create New Plan
          </button>
        </div>
      </>
      )}
    </div>
  );
}

export default SettingsPage;
