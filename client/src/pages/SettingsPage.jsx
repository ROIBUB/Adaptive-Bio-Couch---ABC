import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settingsService';
import './SettingsPage.css';

function SettingsPage() {
  // Single state object for all form fields.
  // Each input's `name` attribute matches a key here.
  const [form, setForm] = useState({
    displayName:   '',
    email:         '',
    theme:         'light',
    fitnessGoal:   '',
    activityLevel: 1,
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
        setForm({
          displayName:   data.displayName   || '',
          email:         data.email         || '',
          theme:         data.theme         || 'light',
          fitnessGoal:   data.fitnessGoal   || '',
          activityLevel: data.activityLevel ?? 1,
        });
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
    setSuccess(''); // clear the success message when the user starts editing again
  };

  // Client-side validation for the three required fields
  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.displayName.trim()) {
      errs.displayName = 'Display name is required';
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      errs.email = 'Enter a valid email address';
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
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setApiError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your profile and preferences</p>
      </div>

      {/* Loading state while GET /api/settings is in-flight */}
      {loading && <p className="loading">Loading settings…</p>}

      {!loading && (
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

          {/* ── Required field 2: Email ── */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={formErrors.email ? 'input-error' : ''}
            />
            {formErrors.email && (
              <span className="error-msg">{formErrors.email}</span>
            )}
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

          {/* ── Optional field: Fitness Goal ── */}
          <div className="form-group">
            <label htmlFor="fitnessGoal">Fitness Goal</label>
            <input
              id="fitnessGoal"
              name="fitnessGoal"
              type="text"
              value={form.fitnessGoal}
              onChange={handleChange}
              placeholder="e.g. muscle gain, fat loss, maintenance"
            />
          </div>

          {/* ── Optional field: Activity Level ── */}
          <div className="form-group">
            <label htmlFor="activityLevel">Activity Level (1 = low, 5 = very active)</label>
            <input
              id="activityLevel"
              name="activityLevel"
              type="number"
              min="1"
              max="5"
              value={form.activityLevel}
              onChange={handleChange}
            />
          </div>

          {/* Server error */}
          {apiError && <div className="api-error">{apiError}</div>}

          {/* Success message */}
          {success && <div className="success-msg">{success}</div>}

          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}

export default SettingsPage;
