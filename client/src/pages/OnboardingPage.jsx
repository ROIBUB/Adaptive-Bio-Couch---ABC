import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProfile, replanProfile } from '../services/profileService';
import './OnboardingPage.css';

function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReplan = searchParams.get('mode') === 'replan';

  // Redirect away if this page is accessed without replan mode
  useEffect(() => {
    if (!isReplan) {
      navigate('/dashboard', { replace: true });
    }
  }, [isReplan, navigate]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    height:          '',
    currentWeight:   '',
    fitnessGoal:     '',
    activityLevel:   '',
    workoutsPerWeek: '',
    mealsPerDay:     '',
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');

  // Pre-populate from current profile
  useEffect(() => {
    if (!isReplan || !user.userId) return;
    const fetchProfile = async () => {
      try {
        const profile = await getProfile(user.userId);
        setForm({
          height:          profile.height          ?? '',
          currentWeight:   profile.currentWeight   ?? '',
          fitnessGoal:     profile.fitnessGoal     || '',
          activityLevel:   profile.activityLevel   || '',
          workoutsPerWeek: profile.workoutsPerWeek ?? '',
          mealsPerDay:     profile.mealsPerDay     ?? '',
        });
      } catch {
        // leave defaults if profile can't be loaded
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isReplan, user.userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fitnessGoal)   errs.fitnessGoal   = 'Please select a fitness goal';
    if (!form.activityLevel) errs.activityLevel = 'Please select an activity level';
    if (!form.height) {
      errs.height = 'Height is required';
    } else if (Number.isNaN(Number(form.height)) || Number(form.height) < 100 || Number(form.height) > 250) {
      errs.height = 'Height must be between 100 and 250 cm';
    }
    if (!form.currentWeight) {
      errs.currentWeight = 'Current weight is required';
    } else if (Number.isNaN(Number(form.currentWeight)) || Number(form.currentWeight) < 30 || Number(form.currentWeight) > 300) {
      errs.currentWeight = 'Weight must be between 30 and 300 kg';
    }
    if (!form.workoutsPerWeek) {
      errs.workoutsPerWeek = 'Workouts per week is required';
    } else if (!Number.isInteger(Number(form.workoutsPerWeek)) || Number(form.workoutsPerWeek) < 1 || Number(form.workoutsPerWeek) > 7) {
      errs.workoutsPerWeek = 'Must be a whole number between 1 and 7';
    }
    if (!form.mealsPerDay) {
      errs.mealsPerDay = 'Meals per day is required';
    } else if (!Number.isInteger(Number(form.mealsPerDay)) || Number(form.mealsPerDay) < 1 || Number(form.mealsPerDay) > 8) {
      errs.mealsPerDay = 'Must be a whole number between 1 and 8';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = {
        fitnessGoal:     form.fitnessGoal,
        activityLevel:   form.activityLevel,
        workoutsPerWeek: Number(form.workoutsPerWeek),
        mealsPerDay:     Number(form.mealsPerDay),
      };
      if (form.height)        payload.height        = Number(form.height);
      if (form.currentWeight) payload.currentWeight = Number(form.currentWeight);

      await replanProfile(user.userId, payload);
      navigate('/dashboard', { state: { planCreated: true } });
    } catch (err) {
      setApiError(err.message || 'Failed to generate plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isReplan) return null;

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">

        <div className="onboarding-header">
          <span className="onboarding-logo">🎯</span>
          <h1>Generate a New Plan</h1>
          <p>Update your fitness preferences and we'll build a fresh workout and meal plan for you.</p>
        </div>

        {loading ? (
          <p className="loading">Loading your current preferences…</p>
        ) : (
          <form className="onboarding-form" onSubmit={handleSubmit} noValidate>

            {/* ── Body Measurements (optional update) ── */}
            <div className="form-section">
              <h3 className="section-title">Body Measurements</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    id="height" name="height" type="number"
                    value={form.height} onChange={handleChange}
                    placeholder="e.g. 175" min="100" max="250"
                    className={errors.height ? 'input-error' : ''}
                  />
                  {errors.height && <span className="error-msg">{errors.height}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="currentWeight">Current Weight (kg)</label>
                  <input
                    id="currentWeight" name="currentWeight" type="number"
                    value={form.currentWeight} onChange={handleChange}
                    placeholder="e.g. 75" min="30" max="300"
                    className={errors.currentWeight ? 'input-error' : ''}
                  />
                  {errors.currentWeight && <span className="error-msg">{errors.currentWeight}</span>}
                </div>
              </div>
            </div>

            {/* ── Goals & Activity ── */}
            <div className="form-section">
              <h3 className="section-title">Goals &amp; Activity</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fitnessGoal">Fitness Goal</label>
                  <select
                    id="fitnessGoal" name="fitnessGoal"
                    value={form.fitnessGoal} onChange={handleChange}
                    className={errors.fitnessGoal ? 'input-error' : ''}
                  >
                    <option value="">Select your goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  {errors.fitnessGoal && <span className="error-msg">{errors.fitnessGoal}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="activityLevel">Activity Level</label>
                  <select
                    id="activityLevel" name="activityLevel"
                    value={form.activityLevel} onChange={handleChange}
                    className={errors.activityLevel ? 'input-error' : ''}
                  >
                    <option value="">Select activity level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  {errors.activityLevel && <span className="error-msg">{errors.activityLevel}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="workoutsPerWeek">Workouts Per Week</label>
                  <input
                    id="workoutsPerWeek" name="workoutsPerWeek" type="number"
                    value={form.workoutsPerWeek} onChange={handleChange}
                    placeholder="1 – 7" min="1" max="7"
                    className={errors.workoutsPerWeek ? 'input-error' : ''}
                  />
                  {errors.workoutsPerWeek && <span className="error-msg">{errors.workoutsPerWeek}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="mealsPerDay">Meals Per Day</label>
                  <input
                    id="mealsPerDay" name="mealsPerDay" type="number"
                    value={form.mealsPerDay} onChange={handleChange}
                    placeholder="1 – 8" min="1" max="8"
                    className={errors.mealsPerDay ? 'input-error' : ''}
                  />
                  {errors.mealsPerDay && <span className="error-msg">{errors.mealsPerDay}</span>}
                </div>
              </div>
            </div>

            {apiError && <div className="api-error">{apiError}</div>}

            <div className="onboarding-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate('/settings')}>
                Cancel
              </button>
              <button type="submit" className="generate-btn" disabled={saving}>
                {saving ? 'Generating…' : 'Generate New Plan'}
              </button>
            </div>

            {saving && (
              <p className="loading-text">
                Analyzing your profile and generating your personalised plan…
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default OnboardingPage;
