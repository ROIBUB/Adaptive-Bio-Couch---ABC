import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import { getWorkoutPlans } from '../services/workoutService';
import { getDailyMealPlans } from '../services/mealService';
import { getCheckIns } from '../services/checkInService';
import { getAllExercises } from '../services/exerciseService';
import './DashboardPage.css';

// Column definitions for the exercises DataTable.
// key   = the property name on each exercise object from the backend
// label = the column header shown in the UI
const EXERCISE_COLUMNS = [
  { key: 'exerciseId',     label: '#' },
  { key: 'name',           label: 'Exercise' },
  { key: 'muscleGroup',    label: 'Muscle Group' },
  { key: 'difficultyLevel',label: 'Difficulty' },
  { key: 'equipment',      label: 'Equipment' },
];

function DashboardPage() {
  // Each data source has its own state so they can load independently
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [mealPlans,    setMealPlans]    = useState([]);
  const [checkIns,     setCheckIns]     = useState([]);
  const [exercises,    setExercises]    = useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Read the logged-in user from localStorage (stored after login)
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');

      // Fire all 4 requests in parallel.
      // allSettled never throws — each result is { status, value } or { status, reason }
      const [plansRes, mealsRes, checkInsRes, exercisesRes] = await Promise.allSettled([
        getWorkoutPlans(),
        getDailyMealPlans(),
        getCheckIns(),
        getAllExercises(),
      ]);

      if (plansRes.status     === 'fulfilled') setWorkoutPlans(plansRes.value   || []);
      if (mealsRes.status     === 'fulfilled') setMealPlans(mealsRes.value      || []);
      if (checkInsRes.status  === 'fulfilled') setCheckIns(checkInsRes.value    || []);
      if (exercisesRes.status === 'fulfilled') setExercises(exercisesRes.value  || []);

      // If ALL four failed, show a top-level error
      const allFailed = [plansRes, mealsRes, checkInsRes, exercisesRes]
        .every(r => r.status === 'rejected');
      if (allFailed) {
        setError('Could not load dashboard data. Make sure the backend is running on port 3000.');
      }

      setLoading(false);
    };

    fetchAll();
  }, []); // empty array = run once when the component first appears on screen

  return (
    <div className="dashboard">

      {/* Page heading */}
      <div className="dashboard-header">
        <h1>Welcome back, {user.firstName || 'User'} 👋</h1>
        <p className="dashboard-subtitle">Here is your fitness overview</p>
      </div>

      {/* Loading state */}
      {loading && <p className="loading">Loading your dashboard…</p>}

      {/* Top-level error */}
      {error && <div className="error-banner">{error}</div>}

      {!loading && (
        <>
          {/* ── Workout Plans ── */}
          <section className="dashboard-section">
            <h2 className="section-title">Workout Plans</h2>
            {workoutPlans.length === 0 ? (
              <p className="empty-state">No workout plans found for your account.</p>
            ) : (
              <div className="cards-grid">
                {workoutPlans.map(plan => (
                  // Card reuse #1 — workout plan
                  <Card
                    key={plan.workoutPlanId}
                    title={plan.name}
                    subtitle={`Goal: ${plan.goal}`}
                    badge={plan.isActive ? 'Active' : 'Inactive'}
                    accentColor={plan.isActive ? '#00b894' : '#b2bec3'}
                    stats={[
                      { label: 'Training Days', value: plan.days?.length ?? 0 },
                      { label: 'Created',        value: plan.createdAt?.slice(0, 10) ?? '—' },
                    ]}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Daily Meal Plans ── */}
          <section className="dashboard-section">
            <h2 className="section-title">Meal Plans</h2>
            {mealPlans.length === 0 ? (
              <p className="empty-state">No meal plans found for your account.</p>
            ) : (
              <div className="cards-grid">
                {mealPlans.map(plan => (
                  // Card reuse #2 — meal plan
                  <Card
                    key={plan.dailyMealPlanId}
                    title={plan.name}
                    subtitle={`Goal: ${plan.goal}`}
                    badge={plan.isActive ? 'Active' : 'Inactive'}
                    accentColor={plan.isActive ? '#0984e3' : '#b2bec3'}
                    stats={[
                      { label: 'Target Calories', value: `${plan.targetCalories} kcal` },
                      { label: 'Target Protein',  value: `${plan.targetProtein} g` },
                      { label: 'Meals',            value: plan.meals?.length ?? 0 },
                    ]}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Recent Check-Ins ── */}
          <section className="dashboard-section">
            <h2 className="section-title">Recent Check-Ins</h2>
            {checkIns.length === 0 ? (
              <p className="empty-state">No check-ins found for your account.</p>
            ) : (
              <div className="cards-grid">
                {checkIns.slice(0, 3).map(ci => (
                  // Card reuse #3 — check-in
                  <Card
                    key={ci.checkInId}
                    title={`Check-In — ${ci.date}`}
                    subtitle={ci.generalFeedback || 'No feedback recorded'}
                    accentColor="#e17055"
                    stats={[
                      { label: 'Weight',    value: `${ci.currentWeight} kg` },
                      { label: 'Energy',    value: ci.energyLevel },
                      { label: 'Hunger',    value: ci.hungerLevel },
                    ]}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Exercise Library (DataTable) ── */}
          <section className="dashboard-section">
            <h2 className="section-title">Exercise Library</h2>
            <DataTable
              columns={EXERCISE_COLUMNS}
              data={exercises}
              caption="All exercises available in the system"
            />
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
