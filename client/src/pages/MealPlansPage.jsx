import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { getDailyMealPlans, getFoodAlternatives } from '../services/mealService';
import { getProgressData, createProgress, updateProgress } from '../services/progressService';
import './MealPlansPage.css';

const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function MealPlansPage() {
  const [plans,           setPlans]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [consumedMealIds, setConsumedMealIds] = useState(new Set());
  const [todayProgress,   setTodayProgress]   = useState(null);
  const [markingMealId,   setMarkingMealId]   = useState(null);
  const [altMap,          setAltMap]          = useState({});
  // altMap key: foodItemId → { loading, data, error, open }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [data, allProgress] = await Promise.all([
          getDailyMealPlans(),
          getProgressData()
        ]);
        setPlans(data || []);
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = allProgress.find(p => p.date === today) || null;
        setTodayProgress(todayRecord);
      } catch (err) {
        setError('Could not load meal plans. Make sure the backend is running on port 3000.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleEaten = async (meal) => {
    const eaten = consumedMealIds.has(meal.mealId);
    setMarkingMealId(meal.mealId);
    const today = new Date().toISOString().split('T')[0];
    try {
      if (!eaten) {
        if (todayProgress) {
          const updated = await updateProgress(todayProgress.progressId, {
            date: todayProgress.date,
            caloriesConsumed: todayProgress.caloriesConsumed + meal.estimatedCalories,
            workoutsCompleted: todayProgress.workoutsCompleted,
            activeMinutes: todayProgress.activeMinutes
          });
          setTodayProgress(prev => ({ ...prev, caloriesConsumed: updated.caloriesConsumed }));
        } else {
          const created = await createProgress({
            date: today,
            caloriesConsumed: meal.estimatedCalories,
            workoutsCompleted: 0,
            activeMinutes: 0
          });
          setTodayProgress(created);
        }
        setConsumedMealIds(prev => new Set([...prev, meal.mealId]));
      } else {
        const updated = await updateProgress(todayProgress.progressId, {
          date: todayProgress.date,
          caloriesConsumed: Math.max(0, todayProgress.caloriesConsumed - meal.estimatedCalories),
          workoutsCompleted: todayProgress.workoutsCompleted,
          activeMinutes: todayProgress.activeMinutes
        });
        setTodayProgress(prev => ({ ...prev, caloriesConsumed: updated.caloriesConsumed }));
        setConsumedMealIds(prev => {
          const next = new Set(prev);
          next.delete(meal.mealId);
          return next;
        });
      }
    } catch (err) {
      setError('Failed to update meal. Please try again.');
    } finally {
      setMarkingMealId(null);
    }
  };

  const handleShowAlternatives = async (fi) => {
    const current = altMap[fi.foodItemId];

    if (current?.open) {
      setAltMap(prev => ({ ...prev, [fi.foodItemId]: { ...prev[fi.foodItemId], open: false } }));
      return;
    }
    if (current?.data || current?.error) {
      setAltMap(prev => ({ ...prev, [fi.foodItemId]: { ...prev[fi.foodItemId], open: true } }));
      return;
    }

    setAltMap(prev => ({ ...prev, [fi.foodItemId]: { loading: true, data: null, error: null, open: true } }));
    try {
      const data = await getFoodAlternatives(fi.foodItemId, fi.quantityGrams);
      setAltMap(prev => ({ ...prev, [fi.foodItemId]: { loading: false, data, error: null, open: true } }));
    } catch {
      setAltMap(prev => ({ ...prev, [fi.foodItemId]: { loading: false, data: null, error: 'Failed to load', open: true } }));
    }
  };

  // Sort meals by the defined order; unknown types go to the end
  const sortedMeals = (meals) =>
    [...(meals || [])].sort(
      (a, b) => (MEAL_ORDER.indexOf(a.mealType) ?? 99) - (MEAL_ORDER.indexOf(b.mealType) ?? 99)
    );

  return (
    <div className="meal-plans-page">
      <div className="page-header">
        <h1>Meal Plans</h1>
        <p>Your personalised nutrition schedules</p>
      </div>

      {todayProgress && (
        <div className="calories-today-banner">
          <span>Calories consumed today:</span>
          <strong>{todayProgress.caloriesConsumed} kcal</strong>
        </div>
      )}

      {loading && <p className="loading">Loading meal plans…</p>}
      {error   && <div className="error-banner">{error}</div>}

      {!loading && !error && plans.length === 0 && (
        <p className="empty-state">No meal plans found for your account.</p>
      )}

      {!loading && plans.map(plan => (
        <section key={plan.dailyMealPlanId} className="plan-section">

          {/* Summary card — Card reuse #1 for this page */}
          <div className="plan-card-row">
            <Card
              title={plan.name}
              subtitle={`Goal: ${plan.goal}`}
              badge={plan.isActive ? 'Active' : 'Inactive'}
              accentColor={plan.isActive ? '#0984e3' : '#b2bec3'}
              stats={[
                { label: 'Target Calories', value: `${plan.targetCalories} kcal` },
                { label: 'Target Protein',  value: `${plan.targetProtein} g` },
                { label: 'Meals',           value: plan.meals?.length ?? 0 },
              ]}
            />
          </div>

          {/* Meals breakdown */}
          <div className="meals-grid">
            {sortedMeals(plan.meals).map((meal, i) => {
              const eaten  = consumedMealIds.has(meal.mealId);
              const saving = markingMealId === meal.mealId;
              return (
                <div key={i} className={`meal-card meal-type-${meal.mealType.toLowerCase()}`}>
                  <div className="meal-header">
                    <span className="meal-type-badge">{meal.mealType}</span>
                    <span className="meal-title">{meal.title}</span>
                  </div>

                  <div className="meal-macros">
                    <span>{meal.estimatedCalories} kcal</span>
                    <span>{meal.estimatedProtein} g protein</span>
                  </div>

                  <ul className="food-list">
                    {(meal.foodItems || []).map((fi, j) => (
                      <li key={j} className="food-item">
                        <div className="food-item-row">
                          <span className="food-name">{fi.foodName}</span>
                          <span className="food-qty">{fi.quantityGrams} g</span>
                          <button
                            className="alt-btn"
                            onClick={() => handleShowAlternatives(fi)}
                          >
                            {altMap[fi.foodItemId]?.open ? 'Hide' : 'Alternatives'}
                          </button>
                        </div>
                        {altMap[fi.foodItemId]?.open && (
                          <div className="alt-panel">
                            {altMap[fi.foodItemId]?.loading && (
                              <span className="alt-loading">Loading…</span>
                            )}
                            {altMap[fi.foodItemId]?.error && (
                              <span className="alt-error">{altMap[fi.foodItemId].error}</span>
                            )}
                            {altMap[fi.foodItemId]?.data?.length === 0 && (
                              <span className="alt-empty">No alternatives found</span>
                            )}
                            {altMap[fi.foodItemId]?.data?.map((alt, k) => (
                              <div key={k} className="alt-item">
                                <span className="alt-name">{alt.name}</span>
                                <span className="alt-detail">{alt.grams}g · {alt.calories} kcal · {alt.protein}g protein</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`mark-eaten-btn${eaten ? ' eaten' : saving ? ' saving' : ''}`}
                    disabled={saving}
                    onClick={() => handleToggleEaten(meal)}
                  >
                    {saving ? 'Saving…' : eaten ? '✓ Eaten' : 'Mark as Eaten'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default MealPlansPage;
