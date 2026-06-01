import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { getProfile } from '../services/profileService';
import { getWorkoutPlans, getWorkoutLogs } from '../services/workoutService';
import { getCheckIns } from '../services/checkInService';
import { getProgressData } from '../services/progressService';
import { getDailyMealPlans } from '../services/mealService';
import './DashboardPage.css';

const GOAL_LABELS = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  maintenance: 'Maintenance',
};

const ACTIVITY_COLUMNS = [
  { key: 'date',   label: 'Date' },
  { key: 'type',   label: 'Activity' },
  { key: 'detail', label: 'Detail' },
];

const VIEWBOX_W = 600;
const VIEWBOX_H = 200;
const GM = { top: 15, right: 20, bottom: 35, left: 45 };

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [planSuccess, setPlanSuccess] = useState(!!location.state?.planCreated);

  // Clear the navigation state so the banner doesn't reappear on refresh
  useEffect(() => {
    if (location.state?.planCreated) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [loading,        setLoading]        = useState(true);
  const [profile,        setProfile]        = useState(null);
  const [profileFailed,  setProfileFailed]  = useState(false);
  const [assignedMealPlan, setAssignedMealPlan] = useState(null);
  const [workoutLogs,    setWorkoutLogs]    = useState([]);
  const [logsFailed,     setLogsFailed]     = useState(false);
  const [checkIns,       setCheckIns]       = useState([]);
  const [checkInsFailed, setCheckInsFailed] = useState(false);
  const [progressData,   setProgressData]   = useState([]);
  const [progressFailed, setProgressFailed] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [profileRes, , logsRes, checkInsRes, progressRes] = await Promise.allSettled([
        getProfile(user.userId),
        getWorkoutPlans(),
        getWorkoutLogs(),
        getCheckIns(),
        getProgressData(),
      ]);

      if (profileRes.status  === 'fulfilled') {
        setProfile(profileRes.value);
        // Fetch the assigned meal plan so the calories target matches the meal plan page
        try {
          const mealPlans = await getDailyMealPlans();
          const assigned = (mealPlans || []).find(
            p => p.dailyMealPlanId === profileRes.value.assignedMealPlanId
          );
          setAssignedMealPlan(assigned || null);
        } catch {
          // Could not load the meal plan — fall back to profile.caloricTarget
        }
      } else {
        setProfileFailed(true);
      }

      if (logsRes.status     === 'fulfilled') setWorkoutLogs(logsRes.value    || []);
      else                                    setLogsFailed(true);

      if (checkInsRes.status === 'fulfilled') setCheckIns(checkInsRes.value   || []);
      else                                    setCheckInsFailed(true);

      if (progressRes.status === 'fulfilled') setProgressData(progressRes.value || []);
      else                                    setProgressFailed(true);

      setLoading(false);
    };
    fetchAll();
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  const today = new Date().toISOString().split('T')[0];
  const todayRecord      = progressData.find(p => p.date === today);
  const caloriesConsumed = todayRecord ? todayRecord.caloriesConsumed : 0;
  const caloriesTarget   = assignedMealPlan?.targetCalories ?? profile?.caloricTarget ?? 0;

  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const workoutsThisWeek = workoutLogs.filter(log => new Date(log.date) >= monday).length;

  const sortedCheckIns = [...checkIns].sort(
    (a, b) => new Date(a.checkInDate) - new Date(b.checkInDate)
  );
  const hasWeightTrend = sortedCheckIns.length >= 2;

  const weightDiff = hasWeightTrend
    ? sortedCheckIns[sortedCheckIns.length - 1].weight - sortedCheckIns[0].weight
    : null;

  const weightDiffColor = (() => {
    if (weightDiff === null) return '#636e72';
    const goal = profile?.fitnessGoal;
    if (goal === 'maintenance') return '#636e72';
    if (goal === 'weight_loss') return weightDiff < 0 ? '#00b894' : '#e17055';
    if (goal === 'muscle_gain') return weightDiff > 0 ? '#00b894' : '#e17055';
    return '#636e72';
  })();

  const svgData = (() => {
    if (!hasWeightTrend) return null;
    const plotW = VIEWBOX_W - GM.left - GM.right;
    const plotH = VIEWBOX_H - GM.top - GM.bottom;
    const weights = sortedCheckIns.map(ci => ci.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const yMin = minW - 2;
    const yMax = maxW + 2;
    const yRange = yMax - yMin;
    const toX = (i) => GM.left + (i / (sortedCheckIns.length - 1)) * plotW;
    const toY = (w) => GM.top + (1 - (w - yMin) / yRange) * plotH;
    return {
      points: sortedCheckIns.map((ci, i) => ({
        x: toX(i),
        y: toY(ci.weight),
        weight: ci.weight,
        date: ci.checkInDate,
      })),
      minW,
      maxW,
    };
  })();

  const activities = [
    ...workoutLogs.map(log => ({
      date:   log.date,
      type:   'Workout Completed',
      detail: log.workoutTitle || '—',
    })),
    ...checkIns.map(ci => ({
      date:   ci.checkInDate,
      type:   'Check-In Submitted',
      detail: `Weight: ${ci.weight} kg`,
    })),
  ];
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentActivity = activities.slice(0, 5);

  return (
    <div className="dashboard">

      {loading && <p className="loading">Loading your dashboard…</p>}

      {!loading && (
        <>
          {planSuccess && (
            <div className="plan-success-banner">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
              </svg>
              <span>Your new plan has been created successfully!</span>
              <button className="plan-success-close" onClick={() => setPlanSuccess(false)}>✕</button>
            </div>
          )}

          {/* ── Welcome ── */}
          <div className="welcome-section">
            <h1>Welcome back, {user.firstName} 👋</h1>
            <div className="welcome-pills">
              <span className="pill">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}>
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
                {GOAL_LABELS[profile?.fitnessGoal] || '—'}
              </span>
              <span className="pill">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}>
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                {profile ? `${profile.currentWeight} kg` : '—'}
              </span>
              <span className="pill">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {profile ? `${profile.workoutsPerWeek} workouts/week` : '—'}
              </span>
            </div>
          </div>

          {/* ── Summary Cards ── */}
          <div className="summary-cards">

            {/* Calories Today */}
            <div className="summary-card" style={{ borderLeftColor: '#00b894' }}>
              <div className="summary-card-title">Calories Today</div>
              {progressFailed ? (
                <div className="summary-card-value" style={{ fontSize: '1rem', color: '#e17055' }}>
                  Could not load calorie data
                </div>
              ) : (
                <>
                  <div className="summary-card-value">
                    {caloriesConsumed} / {caloriesTarget || '—'} kcal
                  </div>
                  <div className="summary-card-subtitle">
                    {caloriesTarget
                      ? caloriesConsumed >= caloriesTarget
                        ? 'Target reached! 🎉'
                        : `${caloriesTarget - caloriesConsumed} kcal remaining`
                      : '—'}
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: caloriesTarget
                          ? `${Math.min((caloriesConsumed / caloriesTarget) * 100, 100)}%`
                          : '0%',
                        background: '#00b894',
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Workouts This Week */}
            <div className="summary-card" style={{ borderLeftColor: '#6c5ce7' }}>
              <div className="summary-card-title">Workouts This Week</div>
              {logsFailed ? (
                <div className="summary-card-value" style={{ fontSize: '1rem', color: '#e17055' }}>
                  Could not load
                </div>
              ) : (
                <>
                  <div className="summary-card-value">
                    {workoutsThisWeek} / {profile?.workoutsPerWeek ?? '—'} this week
                  </div>
                  <div className="summary-card-subtitle">since Monday</div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: profile?.workoutsPerWeek
                          ? `${Math.min((workoutsThisWeek / profile.workoutsPerWeek) * 100, 100)}%`
                          : '0%',
                        background: '#6c5ce7',
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Weight Progress */}
            <div className="summary-card" style={{ borderLeftColor: '#e17055' }}>
              <div className="summary-card-title">Weight Progress</div>
              {checkInsFailed ? (
                <div className="summary-card-value" style={{ fontSize: '1rem', color: '#e17055' }}>
                  Could not load
                </div>
              ) : hasWeightTrend ? (
                <>
                  <div className="summary-card-value" style={{ color: weightDiffColor }}>
                    {weightDiff >= 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                  </div>
                  <div className="summary-card-subtitle">
                    since first check-in ({sortedCheckIns[0].checkInDate})
                  </div>
                </>
              ) : (
                <div className="summary-card-subtitle" style={{ marginTop: '0.5rem' }}>
                  No trend yet — complete your first check-in
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Navigation ── */}
          <div className="quick-nav">
            {[
              { emoji: '🏋️', accent: 'linear-gradient(135deg,#7c3aed,#a78bfa)', label: 'Workout Plans', route: '/workout-plans' },
              { emoji: '🥗', accent: 'linear-gradient(135deg,#059669,#34d399)', label: 'Meal Plans',    route: '/meal-plans'    },
              { emoji: '📊', accent: 'linear-gradient(135deg,#dc6b19,#fb923c)', label: 'Check-Ins',     route: '/check-ins'     },
              { emoji: '⚙️', accent: 'linear-gradient(135deg,#0369a1,#38bdf8)', label: 'Settings',      route: '/settings'      },
            ].map(({ emoji, accent, label, route }) => (
              <button key={route} className="quick-nav-tile" onClick={() => navigate(route)}>
                <div className="quick-nav-emoji-wrap" style={{ background: accent }}>
                  <span className="quick-nav-emoji">{emoji}</span>
                </div>
                <span className="quick-nav-label">{label}</span>
              </button>
            ))}
          </div>

          {/* ── Weight Trend Graph ── */}
          <div className="graph-section">
            <h2 className="section-title">Weight Trend</h2>
            {checkInsFailed ? (
              <p className="graph-placeholder">Could not load</p>
            ) : !hasWeightTrend ? (
              <p className="graph-placeholder">
                Complete at least 2 check-ins to see your weight trend
              </p>
            ) : (
              <svg
                width="100%"
                height="200"
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <polyline
                  points={svgData.points.map(p => `${p.x},${p.y}`).join(' ')}
                  stroke="#6c5ce7"
                  strokeWidth="2"
                  fill="none"
                />
                {svgData.points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#6c5ce7">
                      <title>{p.date}: {p.weight} kg</title>
                    </circle>
                    <text
                      x={p.x}
                      y={VIEWBOX_H - GM.bottom + 15}
                      fontSize="10"
                      textAnchor="middle"
                      fill="#636e72"
                    >
                      {p.date.slice(5)}
                    </text>
                  </g>
                ))}
                <text
                  x={GM.left - 5}
                  y={GM.top}
                  fontSize="10"
                  textAnchor="end"
                  dominantBaseline="hanging"
                  fill="#636e72"
                >
                  {svgData.maxW} kg
                </text>
                <text
                  x={GM.left - 5}
                  y={VIEWBOX_H - GM.bottom}
                  fontSize="10"
                  textAnchor="end"
                  fill="#636e72"
                >
                  {svgData.minW} kg
                </text>
              </svg>
            )}
          </div>

          {/* ── Recent Activity ── */}
          <div className="activity-section">
            <h2 className="section-title">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="empty-state">No recent activity yet.</p>
            ) : (
              <DataTable columns={ACTIVITY_COLUMNS} data={recentActivity} />
            )}
          </div>

          {/* AI Coach Chat — to be implemented separately */}
        </>
      )}
    </div>
  );
}

export default DashboardPage;
