import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { getCheckIns, createCheckIn } from '../services/checkInService';
import './CheckInsPage.css';

const CHECK_IN_COLUMNS = [
  { key: 'checkInDate',       label: 'Date' },
  { key: 'weight',            label: 'Weight (kg)' },
  { key: 'workoutsCompleted', label: 'Workouts Done' },
  { key: 'feedback',          label: 'Feedback' },
];

const EMPTY_FORM = { weight: '', workoutsCompleted: '', feedback: '', checkInDate: '' };

function CheckInsPage() {
  const [checkIns,     setCheckIns]      = useState([]);
  const [loading,      setLoading]       = useState(true);
  const [error,        setError]         = useState('');
  const [showForm,     setShowForm]      = useState(false);
  const [form,         setForm]          = useState(EMPTY_FORM);
  const [formErrors,   setFormErrors]    = useState({});
  const [submitting,   setSubmitting]    = useState(false);
  const [submitError,  setSubmitError]   = useState('');
  const [submitSuccess,setSubmitSuccess] = useState('');

  useEffect(() => {
    const fetchCheckIns = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCheckIns();
        setCheckIns(data || []);
      } catch (err) {
        setError('Could not load check-ins. Make sure the backend is running on port 3000.');
      } finally {
        setLoading(false);
      }
    };
    fetchCheckIns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSubmitSuccess('');
  };

  const validate = () => {
    const errs = {};
    if (!form.weight || isNaN(Number(form.weight)) || Number(form.weight) <= 0) {
      errs.weight = 'Weight must be a positive number';
    }
    if (form.workoutsCompleted === '' || isNaN(Number(form.workoutsCompleted)) || Number(form.workoutsCompleted) < 0) {
      errs.workoutsCompleted = 'Workouts completed must be 0 or more';
    }
    if (!form.checkInDate) {
      errs.checkInDate = 'Date is required';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    const payload = {
      weight:            Number(form.weight),
      workoutsCompleted: Number(form.workoutsCompleted),
      feedback:          form.feedback,
      checkInDate:       form.checkInDate
    };

    setSubmitting(true);
    try {
      const newCheckIn = await createCheckIn(payload);
      setCheckIns(prev => [...prev, newCheckIn]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSubmitSuccess('Check-in recorded successfully!');
    } catch (err) {
      setSubmitError(err.message || 'Failed to save check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="check-ins-page">
      <div className="page-header">
        <h1>Check-Ins</h1>
        <p>Monitor your weekly progress</p>
      </div>

      {loading && <p className="loading">Loading check-ins…</p>}
      {error   && <div className="error-banner">{error}</div>}

      {!loading && (
        <>
          {/* Add check-in toggle */}
          <div className="add-checkin-toggle">
            <button
              className="toggle-btn"
              onClick={() => { setShowForm(prev => !prev); setSubmitError(''); setSubmitSuccess(''); }}
            >
              {showForm ? '— Cancel' : '+ Add Check-In'}
            </button>
          </div>

          {submitSuccess && <div className="success-msg">{submitSuccess}</div>}

          {/* Form */}
          {showForm && (
            <form className="checkin-form" onSubmit={handleSubmit} noValidate>

              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  id="weight" name="weight" type="number" step="0.1"
                  value={form.weight} onChange={handleChange} min="1"
                  placeholder="e.g. 75.5"
                  className={formErrors.weight ? 'input-error' : ''}
                />
                {formErrors.weight && <span className="error-msg">{formErrors.weight}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="workoutsCompleted">Workouts Completed This Week</label>
                <input
                  id="workoutsCompleted" name="workoutsCompleted" type="number"
                  value={form.workoutsCompleted} onChange={handleChange} min="0"
                  placeholder="e.g. 3"
                  className={formErrors.workoutsCompleted ? 'input-error' : ''}
                />
                {formErrors.workoutsCompleted && <span className="error-msg">{formErrors.workoutsCompleted}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="checkInDate">Date</label>
                <input
                  id="checkInDate" name="checkInDate" type="date"
                  value={form.checkInDate} onChange={handleChange}
                  className={formErrors.checkInDate ? 'input-error' : ''}
                />
                {formErrors.checkInDate && <span className="error-msg">{formErrors.checkInDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="feedback">Feedback (optional)</label>
                <input
                  id="feedback" name="feedback" type="text"
                  value={form.feedback} onChange={handleChange}
                  placeholder="How did your week go?"
                />
              </div>

              {submitError && <div className="api-error">{submitError}</div>}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Check-In'}
              </button>
            </form>
          )}

          {/* Check-ins table */}
          <DataTable
            columns={CHECK_IN_COLUMNS}
            data={checkIns}
            caption="Your weekly check-in history"
          />
        </>
      )}
    </div>
  );
}

export default CheckInsPage;
