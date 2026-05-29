import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { getDailyMealPlans } from '../services/mealService';
import './MealPlansPage.css';

const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function MealPlansPage() {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getDailyMealPlans();
        setPlans(data || []);
      } catch (err) {
        setError('Could not load meal plans. Make sure the backend is running on port 3000.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

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
            {sortedMeals(plan.meals).map((meal, i) => (
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
                      <span className="food-name">{fi.foodName}</span>
                      <span className="food-qty">{fi.quantityGrams} g</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default MealPlansPage;
