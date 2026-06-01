import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getWorkoutPlanById, createWorkoutLog } from '../services/workoutService';
import './WorkoutLoggerPage.css';

function WorkoutLoggerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('planId');
  const dayId  = searchParams.get('dayId');

  const [plan,         setPlan]         = useState(null);
  const [day,          setDay]          = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState('');
  const [form,         setForm]         = useState({
    date:             new Date().toISOString().split('T')[0],
    durationMinutes:  '',
    difficultyRating: '',
    notes:            '',
  });
  const [exerciseSets, setExerciseSets] = useState([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  useEffect(() => {
    if (!planId || !dayId) {
      setFetchError('Missing plan or session information. Please go back and select a workout.');
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const data = await getWorkoutPlanById(planId);
        const foundDay = (data.days || []).find(d => d.workoutDayId === Number(dayId));
        if (!foundDay) {
          setFetchError('Workout session not found. Please go back and try again.');
          return;
        }
        setPlan(data);
        setDay(foundDay);
        setExerciseSets(
          (foundDay.exercises || []).map(ex =>
            Array.from({ length: ex.targetSets }, () => ({
              reps:   ex.targetReps,
              weight: ex.targetWeight,
            }))
          )
        );
      } catch (err) {
        setFetchError('Could not load the workout plan. Please go back and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, dayId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSetChange = (exIdx, setIdx, field, value) => {
    setExerciseSets(prev => {
      const next = prev.map(sets => [...sets]);
      next[exIdx] = next[exIdx].map((s, i) => i === setIdx ? { ...s, [field]: value } : s);
      return next;
    });
  };

  const addSet = (exIdx) => {
    setExerciseSets(prev => {
      const next = prev.map(sets => [...sets]);
      const last = next[exIdx][next[exIdx].length - 1];
      next[exIdx] = [...next[exIdx], { reps: last.reps, weight: last.weight }];
      return next;
    });
  };

  const removeSet = (exIdx, setIdx) => {
    setExerciseSets(prev => {
      const next = prev.map(sets => [...sets]);
      next[exIdx] = next[exIdx].filter((_, i) => i !== setIdx);
      return next;
    });
  };

  const validate = () => {
    if (!form.date) return 'Date is required.';
    const todayStr = new Date().toISOString().split('T')[0];
    if (Number.isNaN(new Date(form.date).getTime()))
      return 'Please enter a valid date.';
    if (form.date < '2000-01-01')
      return 'Date must not be before 2000-01-01.';
    if (form.date > todayStr)
      return 'Date must not be in the future.';

    const duration = Number(form.durationMinutes);
    if (!form.durationMinutes || Number.isNaN(duration) || duration < 1 || duration > 600)
      return 'Duration must be a number between 1 and 600 minutes.';

    const diff = Number(form.difficultyRating);
    if (!form.difficultyRating || diff < 1 || diff > 10)
      return 'Difficulty rating must be between 1 and 10.';

    for (let i = 0; i < exerciseSets.length; i++) {
      if (exerciseSets[i].length === 0)
        return `${day.exercises[i].exerciseName} must have at least one set.`;
      for (const s of exerciseSets[i]) {
        const reps   = Number(s.reps);
        const weight = Number(s.weight);
        if (s.reps === '' || s.weight === '' ||
            Number.isNaN(reps) || Number.isNaN(weight) ||
            reps < 0 || reps > 200 ||
            weight < 0 || weight > 1000)
          return 'Please enter valid reps and weight for all sets.';
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validationError = validate();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const payload = {
      userId:           user.userId,
      workoutPlanId:    Number(planId),
      workoutDayId:     Number(dayId),
      date:             form.date,
      workoutTitle:     day.title,
      durationMinutes:  Number(form.durationMinutes),
      difficultyRating: Number(form.difficultyRating),
      notes:            form.notes || '',
      exercises:        day.exercises.map((ex, i) => ({
        exerciseId:   ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets:         exerciseSets[i].map((s, idx) => ({
          setNumber: idx + 1,
          reps:      Number(s.reps),
          weight:    Number(s.weight),
        })),
      })),
    };

    setSubmitting(true);
    try {
      await createWorkoutLog(payload);
      navigate('/workout-logs');
    } catch (err) {
      setSubmitError(err.message || 'Failed to save workout log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="workout-logger-page">
        <p className="loading">Loading session…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="workout-logger-page">
        <div className="error-banner">{fetchError}</div>
        <button className="back-btn" onClick={() => navigate('/workout-plans')}>
          ← Back to Workout Plans
        </button>
      </div>
    );
  }

  return (
    <div className="workout-logger-page">
      <div className="page-header">
        <h1>{day.title}</h1>
        <p>{plan.name}</p>
      </div>

      <form className="logger-form" onSubmit={handleSubmit} noValidate>
        <div className="header-fields">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date" name="date" type="date"
              value={form.date} onChange={handleFormChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="durationMinutes">Duration (minutes)</label>
            <input
              id="durationMinutes" name="durationMinutes" type="number"
              value={form.durationMinutes} onChange={handleFormChange}
              min="1" placeholder="e.g. 45"
            />
          </div>
          <div className="form-group">
            <label htmlFor="difficultyRating">Difficulty Rating (1–10)</label>
            <input
              id="difficultyRating" name="difficultyRating" type="number"
              value={form.difficultyRating} onChange={handleFormChange}
              min="1" max="10" placeholder="1–10"
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <input
              id="notes" name="notes" type="text"
              value={form.notes} onChange={handleFormChange}
              placeholder="How did it feel?"
            />
          </div>
        </div>

        <div className="exercises-section">
          {(day.exercises || []).map((ex, exIdx) => (
            <div key={ex.exerciseId} className="exercise-card">
              <h3 className="exercise-card-title">{ex.exerciseName}</h3>
              <p className="exercise-target">
                Target: {ex.targetSets} × {ex.targetReps}
                {ex.targetWeight === 0 ? ' (Bodyweight)' : ` @ ${ex.targetWeight} kg`}
              </p>

              <table className="sets-table">
                <thead>
                  <tr>
                    <th>Set #</th>
                    <th>Reps</th>
                    <th>{ex.targetWeight === 0 ? 'Bodyweight' : 'Weight (kg)'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseSets[exIdx].map((s, setIdx) => (
                    <tr key={setIdx}>
                      <td className="set-number">{setIdx + 1}</td>
                      <td>
                        <input
                          type="number"
                          className="set-input"
                          value={s.reps}
                          onChange={e => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="set-input"
                          value={s.weight}
                          onChange={e => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                          min="0"
                          step="0.5"
                        />
                      </td>
                      <td>
                        {exerciseSets[exIdx].length >= 2 && (
                          <button
                            type="button"
                            className="remove-set-btn"
                            onClick={() => removeSet(exIdx, setIdx)}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                className="add-set-btn"
                onClick={() => addSet(exIdx)}
              >
                + Add Set
              </button>
            </div>
          ))}
        </div>

        {submitError && <div className="submit-error-banner">{submitError}</div>}

        <button type="submit" className="save-workout-btn" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Workout'}
        </button>
      </form>
    </div>
  );
}

export default WorkoutLoggerPage;
