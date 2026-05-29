import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { getWorkoutLogs, createWorkoutLog } from '../services/workoutService';
import './WorkoutLogsPage.css';

const SETS_COLUMNS = [
  { key: 'setNumber', label: 'Set #' },
  { key: 'reps',      label: 'Reps' },
  { key: 'weight',    label: 'Weight (kg)' },
];

const EMPTY_FORM = { workoutPlanId: '', date: '', durationMinutes: '', notes: '' };

function WorkoutLogsPage() {
  const [logs,         setLogs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [expandedId,   setExpandedId]   = useState(null);
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [formErrors,   setFormErrors]   = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');
  const [submitSuccess,setSubmitSuccess]= useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getWorkoutLogs();
        setLogs(data || []);
      } catch (err) {
        setError('Could not load workout logs. Make sure the backend is running on port 3000.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const toggleExpand = (logId) =>
    setExpandedId(prev => (prev === logId ? null : logId));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSubmitSuccess('');
  };

  const validate = () => {
    const errs = {};
    if (!form.workoutPlanId || isNaN(Number(form.workoutPlanId)) || Number(form.workoutPlanId) <= 0) {
      errs.workoutPlanId = 'Valid workout plan ID is required';
    }
    if (!form.date) {
      errs.date = 'Date is required';
    }
    if (!form.durationMinutes || isNaN(Number(form.durationMinutes)) || Number(form.durationMinutes) <= 0) {
      errs.durationMinutes = 'Duration must be a positive number';
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

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const payload = {
      userId:          user.userId,
      workoutPlanId:   Number(form.workoutPlanId),
      date:            form.date,
      workoutTitle:    `Workout – ${form.date}`,
      exercises:       [{ exerciseId: 1, exerciseName: 'General Workout', sets: [{ setNumber: 1, reps: 0, weight: 0 }] }],
      durationMinutes: Number(form.durationMinutes),
      difficultyRating: 5,
      notes:           form.notes
    };

    setSubmitting(true);
    try {
      const newLog = await createWorkoutLog(payload);
      setLogs(prev => [...prev, newLog]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSubmitSuccess('Workout log added successfully!');
    } catch (err) {
      setSubmitError(err.message || 'Failed to add workout log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="workout-logs-page">
      <div className="page-header">
        <h1>Workout Logs</h1>
        <p>Track your completed workouts</p>
      </div>

      {loading && <p className="loading">Loading workout logs…</p>}
      {error   && <div className="error-banner">{error}</div>}

      {!loading && (
        <>
          {/* Add Log toggle */}
          <div className="add-log-toggle">
            <button
              className="toggle-btn"
              onClick={() => { setShowForm(prev => !prev); setSubmitError(''); setSubmitSuccess(''); }}
            >
              {showForm ? '— Cancel' : '+ Add Workout Log'}
            </button>
          </div>

          {submitSuccess && <div className="success-msg">{submitSuccess}</div>}

          {/* Add Log form */}
          {showForm && (
            <form className="log-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="workoutPlanId">Workout Plan ID</label>
                <input
                  id="workoutPlanId" name="workoutPlanId" type="number"
                  value={form.workoutPlanId} onChange={handleChange} min="1"
                  placeholder="e.g. 1"
                  className={formErrors.workoutPlanId ? 'input-error' : ''}
                />
                {formErrors.workoutPlanId && <span className="error-msg">{formErrors.workoutPlanId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date" name="date" type="date"
                  value={form.date} onChange={handleChange}
                  className={formErrors.date ? 'input-error' : ''}
                />
                {formErrors.date && <span className="error-msg">{formErrors.date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="durationMinutes">Duration (minutes)</label>
                <input
                  id="durationMinutes" name="durationMinutes" type="number"
                  value={form.durationMinutes} onChange={handleChange} min="1"
                  placeholder="e.g. 45"
                  className={formErrors.durationMinutes ? 'input-error' : ''}
                />
                {formErrors.durationMinutes && <span className="error-msg">{formErrors.durationMinutes}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (optional)</label>
                <input
                  id="notes" name="notes" type="text"
                  value={form.notes} onChange={handleChange}
                  placeholder="How did it go?"
                />
              </div>

              {submitError && <div className="api-error">{submitError}</div>}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Log'}
              </button>
            </form>
          )}

          {/* Logs table */}
          {logs.length === 0 ? (
            <p className="empty-state">No workout logs found for your account.</p>
          ) : (
            <div className="logs-table-wrapper">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Workout</th>
                    <th>Duration (min)</th>
                    <th>Difficulty</th>
                    <th>Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <React.Fragment key={log.workoutLogId}>
                      <tr className={expandedId === log.workoutLogId ? 'row-expanded' : ''}>
                        <td>{log.date}</td>
                        <td>{log.workoutTitle}</td>
                        <td>{log.durationMinutes}</td>
                        <td>{log.difficultyRating}/10</td>
                        <td className="notes-cell">{log.notes || '—'}</td>
                        <td>
                          <button
                            className="details-btn"
                            onClick={() => toggleExpand(log.workoutLogId)}
                          >
                            {expandedId === log.workoutLogId ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>

                      {expandedId === log.workoutLogId && (
                        <tr className="expand-row">
                          <td colSpan={6}>
                            <div className="expand-panel">
                              {(log.exercises || []).map((ex, i) => (
                                <div key={i} className="ex-block">
                                  <h4 className="ex-block-title">{ex.exerciseName}</h4>
                                  <DataTable
                                    columns={SETS_COLUMNS}
                                    data={ex.sets}
                                    caption={`Sets for ${ex.exerciseName}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WorkoutLogsPage;
