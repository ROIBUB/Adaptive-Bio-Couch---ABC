import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import { getWorkoutPlans } from '../services/workoutService';
import './WorkoutPlansPage.css';

const EXERCISE_COLUMNS = [
  { key: 'day',          label: 'Day' },
  { key: 'exerciseName', label: 'Exercise' },
  { key: 'targetSets',   label: 'Sets' },
  { key: 'targetReps',   label: 'Reps' },
  { key: 'targetWeight', label: 'Weight (kg)' },
];

function WorkoutPlansPage() {
  const navigate = useNavigate();
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getWorkoutPlans();
        setPlans(data || []);
      } catch (err) {
        setError('Could not load workout plans. Make sure the backend is running on port 3000.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Flatten all exercises across all days for the DataTable
  const flattenExercises = (plan) =>
    (plan.days || []).flatMap(day =>
      (day.exercises || []).map(ex => ({
        day:           `${day.day} – ${day.title}`,
        exerciseName:  ex.exerciseName,
        targetSets:    ex.targetSets,
        targetReps:    ex.targetReps,
        targetWeight:  ex.targetWeight === 0 ? 'Bodyweight' : `${ex.targetWeight} kg`,
      }))
    );

  return (
    <div className="workout-plans-page">
      <div className="page-header">
        <h1>Workout Plans</h1>
        <p>Your personalised training schedules</p>
      </div>

      {loading && <p className="loading">Loading workout plans…</p>}
      {error   && <div className="error-banner">{error}</div>}

      {!loading && !error && plans.length === 0 && (
        <p className="empty-state">No workout plans found for your account.</p>
      )}

      {!loading && plans.map(plan => (
        <section key={plan.workoutPlanId} className="plan-section">

          {/* Summary card */}
          <div className="plan-card-row">
            <Card
              title={plan.name}
              subtitle={`Goal: ${plan.goal}`}
              badge={plan.isActive ? 'Active' : 'Inactive'}
              accentColor={plan.isActive ? '#00b894' : '#b2bec3'}
              stats={[
                { label: 'Training Days', value: plan.days?.length ?? 0 },
                { label: 'Created',       value: plan.createdAt?.slice(0, 10) ?? '—' },
              ]}
            />
          </div>

          {/* Training days breakdown */}
          <div className="days-grid">
            {(plan.days || []).map((day, i) => (
              <div key={i} className="day-card">
                <div className="day-card-content">
                  <div className="day-header">
                    <span className="day-name">{day.day}</span>
                    <span className="day-title">{day.title}</span>
                  </div>
                  <ul className="exercise-list">
                    {(day.exercises || []).map((ex, j) => (
                      <li key={j} className="exercise-item">
                        <span className="ex-name">{ex.exerciseName}</span>
                        <span className="ex-detail">
                          {ex.targetSets} × {ex.targetReps}
                          {ex.targetWeight > 0 ? ` @ ${ex.targetWeight} kg` : ' (Bodyweight)'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="day-card-actions">
                  <button
                    className="start-workout-btn"
                    onClick={() => navigate(`/workout-logs/new?planId=${plan.workoutPlanId}&dayId=${day.workoutDayId}`)}
                  >
                    Start Workout
                  </button>
                  <button
                    className="view-logs-btn"
                    onClick={() => navigate(`/workout-logs?workoutDayId=${day.workoutDayId}&dayTitle=${encodeURIComponent(day.title)}`)}
                  >
                    View Logs
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* All exercises table */}
          <div className="plan-table">
            <h3 className="table-heading">All Exercises — {plan.name}</h3>
            <DataTable
              columns={EXERCISE_COLUMNS}
              data={flattenExercises(plan)}
              caption={`Full exercise list for ${plan.name}`}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

export default WorkoutPlansPage;
