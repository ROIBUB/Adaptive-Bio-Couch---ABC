import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AIChatWidget from '../components/AIChatWidget';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { getProfile } from '../services/profileService';
import { getWorkoutLogs, getWorkoutPlans } from '../services/workoutService';
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
  { key: 'date',        label: 'Date' },
  {
    key: 'type',
    label: 'Activity',
    render: (v) => v === 'Workout'
      ? <span className="badge badge-brand">💪 Workout</span>
      : <span className="badge badge-success">📊 Check-In</span>,
  },
  { key: 'description', label: 'Description' },
  { key: 'value',       label: 'Value' },
];

const VIEWBOX_W = 600;
const VIEWBOX_H = 200;
const GM = { top: 15, right: 20, bottom: 35, left: 45 };

function ic(size, children) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dash-skeleton">
      <div className="skel dash-skel-hero" />
      <div className="dash-skel-cards">
        {[0, 1, 2].map(i => <div key={i} className="skel dash-skel-card" />)}
      </div>
      <div className="dash-skel-nav">
        {[0, 1, 2, 3].map(i => <div key={i} className="skel dash-skel-nav-tile" />)}
      </div>
      <div className="skel dash-skel-graph" />
      <div className="dash-skel-timeline">
        {[0, 1, 2].map(i => <div key={i} className="skel dash-skel-row" />)}
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [planSuccess, setPlanSuccess] = useState(!!location.state?.planCreated);

  useEffect(() => {
    if (location.state?.planCreated) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [loading,          setLoading]          = useState(true);
  const [profile,          setProfile]          = useState(null);
  const [profileFailed,    setProfileFailed]    = useState(false);
  const [assignedMealPlan, setAssignedMealPlan] = useState(null);
  const [workoutLogs,      setWorkoutLogs]      = useState([]);
  const [logsFailed,       setLogsFailed]       = useState(false);
  const [checkIns,         setCheckIns]         = useState([]);
  const [checkInsFailed,   setCheckInsFailed]   = useState(false);
  const [progressData,     setProgressData]     = useState([]);
  const [progressFailed,   setProgressFailed]   = useState(false);
  const [workoutPlans,     setWorkoutPlans]     = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [profileRes, logsRes, checkInsRes, progressRes, plansRes] = await Promise.allSettled([
        getProfile(user.userId),
        getWorkoutLogs(),
        getCheckIns(),
        getProgressData(),
        getWorkoutPlans(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
        try {
          const mealPlans = await getDailyMealPlans();
          const assigned = (mealPlans || []).find(
            p => p.dailyMealPlanId === profileRes.value.assignedMealPlanId
          );
          setAssignedMealPlan(assigned || null);
        } catch {
          // fall back to profile.caloricTarget
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

      if (plansRes.status === 'fulfilled') setWorkoutPlans(plansRes.value || []);

      setLoading(false);
    };
    fetchAll();
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  const today            = new Date().toISOString().split('T')[0];
  const todayRecord      = progressData.find(p => p.date === today);
  const caloriesConsumed = todayRecord ? todayRecord.caloriesConsumed : 0;
  const caloriesTarget   = assignedMealPlan?.targetCalories ?? profile?.caloricTarget ?? 0;

  const now        = new Date();
  const dayOfWeek  = now.getDay();
  const monday     = new Date(now);
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
    if (weightDiff === null) return 'var(--text-secondary)';
    const goal = profile?.fitnessGoal;
    if (goal === 'maintenance') return 'var(--text-secondary)';
    if (goal === 'weight_loss') return weightDiff < 0 ? 'var(--success)' : 'var(--danger)';
    if (goal === 'muscle_gain') return weightDiff > 0 ? 'var(--success)' : 'var(--danger)';
    return 'var(--text-secondary)';
  })();

  const weightDiffBadgeClass = (() => {
    if (weightDiff === null) return 'badge-neutral';
    const goal = profile?.fitnessGoal;
    if (goal === 'maintenance') return 'badge-neutral';
    if (goal === 'weight_loss') return weightDiff < 0 ? 'badge-success' : 'badge-warning';
    if (goal === 'muscle_gain') return weightDiff > 0 ? 'badge-success' : 'badge-warning';
    return 'badge-neutral';
  })();

  const insightLine = (() => {
    if (!profile) return 'Loading your personalised plan…';
    const wpw = profile.workoutsPerWeek || 0;
    if (wpw > 0 && workoutsThisWeek >= wpw) {
      return `Weekly workout goal complete — ${workoutsThisWeek} session${workoutsThisWeek !== 1 ? 's' : ''} logged!`;
    }
    if (workoutsThisWeek > 0) {
      return `${workoutsThisWeek} of ${wpw} workouts done this week. Keep the momentum going!`;
    }
    return `Your goal is ${wpw} workout${wpw !== 1 ? 's' : ''} this week — start your first session!`;
  })();

  const svgData = (() => {
    if (!hasWeightTrend) return null;
    const plotW   = VIEWBOX_W - GM.left - GM.right;
    const plotH   = VIEWBOX_H - GM.top  - GM.bottom;
    const weights = sortedCheckIns.map(ci => ci.weight);
    const minW    = Math.min(...weights);
    const maxW    = Math.max(...weights);
    const yMin    = minW - 2;
    const yMax    = maxW + 2;
    const yRange  = yMax - yMin;
    const toX     = (i) => GM.left + (i / (sortedCheckIns.length - 1)) * plotW;
    const toY     = (w) => GM.top  + (1 - (w - yMin) / yRange) * plotH;
    return {
      points: sortedCheckIns.map((ci, i) => ({
        x: toX(i), y: toY(ci.weight), weight: ci.weight, date: ci.checkInDate,
      })),
      minW,
      maxW,
    };
  })();

  const activities = [
    ...workoutLogs.map(log => ({
      date:        log.date,
      type:        'Workout',
      description: 'Workout Completed',
      value:       log.workoutTitle || '—',
    })),
    ...checkIns.map(ci => ({
      date:        ci.checkInDate,
      type:        'Check-In',
      description: 'Check-In Submitted',
      value:       `${ci.weight} kg`,
    })),
  ];
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentActivity = activities.slice(0, 5);

  const DAY_NAMES  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = DAY_NAMES[new Date().getDay()];
  const activePlan   = workoutPlans.find(p => p.isActive);
  const todayDayObj  = activePlan?.days?.find(d => d.day === todayDayName) ?? null;

  return (
    <div className="dashboard">
      {loading ? <DashboardSkeleton /> : (
        <>
          {planSuccess && (
            <div className="plan-success-banner">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
              </svg>
              <span>Your new plan has been created successfully!</span>
              <button className="plan-success-close" onClick={() => setPlanSuccess(false)}>✕</button>
            </div>
          )}

          {/* ── Hero ── */}
          <div className="hero">
            <div className="hero-content">
              <h1 className="hero-title">
                Welcome back, {user.firstName} <span className="hero-wave">👋</span>
              </h1>
              <p className="hero-subtitle">{insightLine}</p>
              <div className="hero-chips">
                <span className="hero-chip">
                  {ic(13, <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>)}
                  {GOAL_LABELS[profile?.fitnessGoal] || '—'}
                </span>
                <span className="hero-chip">
                  {ic(13, <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>)}
                  {profile ? `${profile.currentWeight} kg` : '—'}
                </span>
                <span className="hero-chip">
                  {ic(13, <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>)}
                  {profile ? `${profile.workoutsPerWeek} workouts/week` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Summary Cards ── */}
          <div className="summary-cards">

            {/* Calories Today */}
            <div className="summary-card">
              <div className="summary-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                {ic(18, <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>)}
              </div>
              <div className="summary-card-title">Calories Today</div>
              {progressFailed ? (
                <div className="summary-card-value" style={{ fontSize: '1rem', color: 'var(--danger)' }}>
                  Could not load
                </div>
              ) : (
                <>
                  <div className="summary-card-value">
                    {caloriesConsumed}
                    <span className="summary-card-target"> / {caloriesTarget || '—'} kcal</span>
                  </div>
                  <div className="summary-card-subtitle">
                    {caloriesTarget
                      ? caloriesConsumed >= caloriesTarget
                        ? 'Target reached! 🎉'
                        : `${caloriesTarget - caloriesConsumed} kcal remaining`
                      : 'No target set'}
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: caloriesTarget
                          ? `${Math.min((caloriesConsumed / caloriesTarget) * 100, 100)}%`
                          : '0%',
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Workouts This Week */}
            <div className="summary-card">
              <div className="summary-card-icon" style={{ background: 'var(--brand-50)', color: 'var(--brand)' }}>
                {ic(18, <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>)}
              </div>
              <div className="summary-card-title">Workouts This Week</div>
              {logsFailed ? (
                <div className="summary-card-value" style={{ fontSize: '1rem', color: 'var(--danger)' }}>
                  Could not load
                </div>
              ) : (
                <>
                  <div className="summary-card-value">
                    {workoutsThisWeek}
                    <span className="summary-card-target"> / {profile?.workoutsPerWeek ?? '—'}</span>
                  </div>
                  <div className="summary-card-subtitle">since Monday</div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: profile?.workoutsPerWeek
                          ? `${Math.min((workoutsThisWeek / profile.workoutsPerWeek) * 100, 100)}%`
                          : '0%',
                        background: 'linear-gradient(90deg, var(--brand), var(--brand-light))',
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Weight Progress */}
            <div className="summary-card">
              <div className="summary-card-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                {ic(18, <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>)}
              </div>
              <div className="summary-card-title">Weight Progress</div>
              {checkInsFailed ? (
                <div className="summary-card-value" style={{ fontSize: '1rem', color: 'var(--danger)' }}>
                  Could not load
                </div>
              ) : hasWeightTrend ? (
                <>
                  <div className="summary-card-value" style={{ color: weightDiffColor }}>
                    {weightDiff >= 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                    <span className={`badge ${weightDiffBadgeClass}`} style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>
                      {weightDiff >= 0 ? '↑' : '↓'}
                    </span>
                  </div>
                  <div className="summary-card-subtitle">
                    since first check-in ({sortedCheckIns[0].checkInDate})
                  </div>
                </>
              ) : (
                <div className="summary-card-subtitle" style={{ marginTop: '0.5rem' }}>
                  Complete at least 2 check-ins to see your weight trend
                </div>
              )}
            </div>
          </div>

          {/* ── Today's Focus ── */}
          {activePlan && (
            <div className={`today-focus-card${todayDayObj ? ' today-focus-card--active' : ''}`}>
              <div className="today-focus-label">Today's Focus · {todayDayName}</div>
              {todayDayObj ? (
                <>
                  <div className="today-focus-title">{todayDayObj.title}</div>
                  <div className="today-focus-exercises">
                    {(todayDayObj.exercises || []).slice(0, 4).map((ex, i) => (
                      <span key={i} className="today-focus-ex">{ex.exerciseName}</span>
                    ))}
                    {(todayDayObj.exercises || []).length > 4 && (
                      <span className="today-focus-ex today-focus-more">
                        +{todayDayObj.exercises.length - 4} more
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="today-focus-rest">
                  Rest Day — Recovery is part of the plan. 🧘
                </div>
              )}
            </div>
          )}

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
            <div className="section-header">
              <h2 className="section-title">Weight Trend</h2>
              {hasWeightTrend && weightDiff !== null && (
                <span className={`badge ${weightDiffBadgeClass}`}>
                  {weightDiff >= 0 ? '+' : ''}{weightDiff.toFixed(1)} kg total
                </span>
              )}
            </div>
            {checkInsFailed ? (
              <p className="graph-placeholder">Could not load weight data</p>
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
                  stroke="#a78bfa"
                  strokeWidth="2.5"
                  fill="none"
                />
                {svgData.points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#a78bfa">
                      <title>{p.date}: {p.weight} kg</title>
                    </circle>
                    <text x={p.x} y={VIEWBOX_H - GM.bottom + 15} fontSize="10" textAnchor="middle" fill="rgba(255,255,255,0.45)">
                      {p.date.slice(5)}
                    </text>
                  </g>
                ))}
                <text x={GM.left - 5} y={GM.top} fontSize="10" textAnchor="end" dominantBaseline="hanging" fill="rgba(255,255,255,0.45)">
                  {svgData.maxW} kg
                </text>
                <text x={GM.left - 5} y={VIEWBOX_H - GM.bottom} fontSize="10" textAnchor="end" fill="rgba(255,255,255,0.45)">
                  {svgData.minW} kg
                </text>
              </svg>
            )}
          </div>

          {/* ── Recent Activity ── */}
          <div className="activity-section">
            <div className="activity-table-header">
              <h2 className="section-title">Recent Activity</h2>
              <span className="badge badge-neutral">{recentActivity.length} entries</span>
            </div>
            {recentActivity.length === 0 ? (
              <div style={{ padding: '1.5rem' }}>
                <EmptyState
                  icon={ic(22, <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>)}
                  title="No recent activity yet"
                  description="Complete a workout or submit a check-in to see your activity here."
                />
              </div>
            ) : (
              <DataTable
                columns={ACTIVITY_COLUMNS}
                data={recentActivity}
                caption="Your 5 most recent fitness activities"
              />
            )}
          </div>

          <AIChatWidget />
        </>
      )}
    </div>
  );
}

export default DashboardPage;
