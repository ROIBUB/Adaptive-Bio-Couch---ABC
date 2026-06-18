import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { getWorkoutPlans } from '../services/workoutService';
import './WorkoutPlansPage.css';

const EXERCISE_COLUMNS = [
  { key: 'day',          label: 'Day' },
  { key: 'exerciseName', label: 'Exercise' },
  { key: 'targetSets',   label: 'Sets' },
  { key: 'targetReps',   label: 'Reps' },
  {
    key: 'targetWeight',
    label: 'Weight',
    render: (v) => v === 0
      ? <span className="badge badge-success">Bodyweight</span>
      : <span className="badge badge-brand">{v} kg</span>,
  },
];

const flattenExercises = (plan) =>
  (plan.days || []).flatMap(day =>
    (day.exercises || []).map(ex => ({
      day:          day.day,
      exerciseName: ex.exerciseName,
      targetSets:   ex.targetSets,
      targetReps:   ex.targetReps,
      targetWeight: ex.targetWeight,
    }))
  );

function WorkoutPlansSkeleton() {
  return (
    <div className="wpp-skeleton">
      <div className="skel wpp-skel-card" />
      <div className="wpp-skel-grid">
        {[0, 1, 2, 3].map(i => <div key={i} className="skel wpp-skel-day" />)}
      </div>
    </div>
  );
}

function WorkoutPlansPage() {
  const navigate = useNavigate();
  const [plans,    setPlans]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [openDays, setOpenDays] = useState(new Set());

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

  const toggleDay = (key) => {
    setOpenDays(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="workout-plans-page">
      <div className="page-header">
        <h1>Workout Plans</h1>
        <p>Your personalised training schedules</p>
      </div>

      {loading && <WorkoutPlansSkeleton />}
      {error   && <div className="error-banner">{error}</div>}

      {!loading && !error && plans.length === 0 && (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4v16M18 4v16M4 9h4M4 15h4M16 9h4M16 15h4M8 12h8"/>
            </svg>
          }
          title="No workout plans yet"
          description="Your personalised workout plan will appear here once it's been generated."
        />
      )}

      {!loading && plans.map(plan => (
        <section key={plan.workoutPlanId} className="plan-section">

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

          <div className="days-accordion">
            {(plan.days || []).map((day, i) => {
              const key    = `${plan.workoutPlanId}-${i}`;
              const isOpen = openDays.has(key);
              return (
                <div key={i} className={`day-card${isOpen ? ' day-card--open' : ''}`}>
                  <button
                    className="day-card-header"
                    onClick={() => toggleDay(key)}
                    aria-expanded={isOpen}
                  >
                    <div className="day-header-text">
                      <span className="day-name">{day.day}</span>
                      <span className="day-title">{day.title}</span>
                    </div>
                    <div className="day-header-right">
                      <span className="day-ex-count">{day.exercises?.length || 0} ex</span>
                      <svg
                        className={`day-chevron${isOpen ? ' open' : ''}`}
                        xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="day-exercises">
                      {(day.exercises || []).length === 0 ? (
                        <p className="day-empty">No exercises scheduled for this day.</p>
                      ) : (
                        (day.exercises || []).map((ex, j) => (
                          <div key={j} className="ex-card">
                            <div className="ex-card-icon">🏋️</div>
                            <div className="ex-card-info">
                              <span className="ex-card-name">{ex.exerciseName}</span>
                              <span className="ex-card-detail">
                                {ex.targetSets} sets × {ex.targetReps} reps
                              </span>
                            </div>
                            {ex.targetWeight > 0
                              ? <span className="ex-card-weight">{ex.targetWeight} kg</span>
                              : <span className="ex-card-bw">Bodyweight</span>
                            }
                          </div>
                        ))
                      )}
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
                  )}
                </div>
              );
            })}
          </div>

          {/* Exercise Library */}
          <div className="exercise-library">
            <div className="exercise-library-header">
              <h3 className="exercise-library-title">📋 Exercise Library</h3>
              <span className="badge badge-neutral">{flattenExercises(plan).length} exercises</span>
            </div>
            <DataTable
              columns={EXERCISE_COLUMNS}
              data={flattenExercises(plan)}
              caption={`Complete exercise reference for ${plan.name}`}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

export default WorkoutPlansPage;
