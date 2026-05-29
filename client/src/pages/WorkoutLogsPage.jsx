import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { getWorkoutLogs } from '../services/workoutService';
import './WorkoutLogsPage.css';

const SETS_COLUMNS = [
  { key: 'setNumber', label: 'Set #' },
  { key: 'reps',      label: 'Reps' },
  { key: 'weight',    label: 'Weight (kg)' },
];

function WorkoutLogsPage() {
  const navigate = useNavigate();
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [expandedId, setExpandedId] = useState(null);

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
          <div className="add-log-toggle">
            <button
              className="new-workout-btn"
              onClick={() => navigate('/workout-plans')}
            >
              + New Workout
            </button>
          </div>

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
