const { GoogleGenerativeAI } = require('@google/generative-ai');
const AiRecommendationsModel  = require('../models/aiRecommendations.model');
const ProfilesModel           = require('../models/profiles.model');
const CheckInsModel           = require('../models/checkIns.model');
const WorkoutLogsModel        = require('../models/workoutLogs.model');
const WorkoutPlansModel       = require('../models/workoutPlans.model');
const DailyMealPlansModel     = require('../models/dailyMealPlans.model');

const analyzeProgress = async (userId) => {
    // ── STEP 1 ── collect data in parallel ──────────────────────────────────
    const [profile, checkIns, workoutLogs, activePlans, activeMealPlans] = await Promise.all([
        ProfilesModel.getByUserId(userId),
        CheckInsModel.getByUserId(userId),
        WorkoutLogsModel.getByUserId(userId),
        WorkoutPlansModel.getByUserId(userId),
        DailyMealPlansModel.getByUserId(userId)
    ]);

    const activePlan     = activePlans?.[0]     ?? null;
    const activeMealPlan = activeMealPlans?.[0] ?? null;

    // ── STEP 2 ── build summaries ────────────────────────────────────────────

    // Weight trend — last 6 check-ins ascending by date
    let weightSummary;
    if (!checkIns || checkIns.length === 0) {
        weightSummary = 'No check-in history available yet.';
    } else {
        const sorted = [...checkIns].sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
        const recent = sorted.slice(-6);
        weightSummary = recent.map(ci => `${ci.checkInDate}: ${ci.weight} kg`).join('\n');
    }

    // Workout performance — logs from the last 21 days only
    let workoutSummary;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 21);
    const recentLogs = workoutLogs
        ? workoutLogs.filter(l => new Date(l.date) >= cutoff)
        : [];

    if (recentLogs.length === 0) {
        workoutSummary = 'No workout history available yet.';
    } else {
        workoutSummary = recentLogs.map(log => {
            const exerciseLines = (log.exercises || []).map(ex => {
                const setList = (ex.sets || [])
                    .map(s => `(${s.weight ?? 0} kg x ${s.reps} reps)`)
                    .join(', ');
                return `${ex.exerciseName}: ${setList}`;
            }).join('; ');
            return `${log.date} — ${exerciseLines || 'no exercises recorded'}`;
        }).join('\n');
    }

    // Current workout plan — exercises with their target values
    let currentPlanSummary = 'No active workout plan found.';
    if (activePlan) {
        const lines = [];
        for (const day of activePlan.days) {
            for (const ex of day.exercises) {
                lines.push(
                    `planExerciseId: ${ex.id} | day: ${day.day} | exercise: ${ex.exerciseName} | sets: ${ex.targetSets} | reps: ${ex.targetReps} | weight: ${ex.targetWeight ?? 'bodyweight'} kg`
                );
            }
        }
        currentPlanSummary = lines.join('\n');
    }

    // ── STEP 3 ── build prompt ───────────────────────────────────────────────
    const prompt = `
You are a fitness coach AI. Analyze the following user data and return a JSON assessment.

USER PROFILE:
- Fitness goal: ${profile?.fitnessGoal ?? 'unknown'}
- Activity level: ${profile?.activityLevel ?? 'unknown'}
- Current weight: ${profile?.currentWeight ?? 'unknown'} kg
- Target weight: ${profile?.targetWeight ?? 'unknown'} kg
- Daily caloric target: ${profile?.caloricTarget ?? 'unknown'} kcal

WEIGHT TREND (last 6 check-ins):
${weightSummary}

NUTRITION:
No direct nutrition data is tracked. Reason about caloric adherence indirectly using the weight trend and the user's caloric target of ${profile?.caloricTarget ?? 'unknown'} kcal.

WORKOUT PERFORMANCE (last 21 days):
${workoutSummary}

CURRENT WORKOUT PLAN (use planExerciseId values for exercise adjustments):
${currentPlanSummary}

STRICT REQUIREMENTS:
1. Respond with ONLY raw JSON. No markdown, no code fences, no backticks, no extra text.
2. weightAssessment, nutritionAssessment, workoutAssessment must each be a single sentence.
3. recommendations must be a non-empty array. Each item must have: type, priority, change, reason.
   type must be one of: workout, nutrition, general
   priority must be one of: high, medium, low
4. actions.caloricTargetAdjustment must be an integer or null.
   Only suggest a non-null value if there is clear evidence from the data.
   For weight_loss: negative value only if weight is not decreasing. Never below -500.
   For muscle_gain: positive value only if weight is not increasing. Never above +500.
   For maintenance: small adjustment only if weight is drifting significantly.
   If no adjustment is needed return null.
5. actions.exerciseAdjustments must be an array.
   Only include entries if there is evidence of plateau or regression in workout logs.
   If no workout history is available return an empty array.
   Use only planExerciseId values from the CURRENT WORKOUT PLAN section above.
   Each entry must include planExerciseId and only the fields that should change
   (omit newTargetSets, newTargetReps, or newTargetWeight if that field stays the same).
6. Some data sections may say 'not available' — base the assessment for that dimension
   on the user's profile goals only and note that there is insufficient history to evaluate.

EXPECTED JSON SHAPE — return exactly this structure:
{
  "weightAssessment": "one sentence evaluation of weight trend",
  "nutritionAssessment": "one sentence evaluation of calorie adherence",
  "workoutAssessment": "one sentence evaluation of workout performance",
  "recommendations": [
    {
      "type": "workout",
      "priority": "high",
      "change": "specific action to take",
      "reason": "data-driven justification"
    }
  ],
  "actions": {
    "caloricTargetAdjustment": -200,
    "exerciseAdjustments": [
      {
        "planExerciseId": 3,
        "newTargetSets": 4,
        "newTargetReps": 10,
        "newTargetWeight": 27.5
      }
    ]
  }
}
`.trim();

    // ── STEP 4 ── call Gemini ────────────────────────────────────────────────
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // ── STEP 5 ── parse and validate ─────────────────────────────────────────
    const cleaned = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    let aiResponse;
    try {
        aiResponse = JSON.parse(cleaned);
    } catch {
        throw new Error(`AI response was not valid JSON. Raw response: ${raw}`);
    }

    const { weightAssessment, nutritionAssessment, workoutAssessment, recommendations, actions } = aiResponse;

    if (typeof weightAssessment !== 'string')
        throw new Error('AI response missing or invalid: weightAssessment');
    if (typeof nutritionAssessment !== 'string')
        throw new Error('AI response missing or invalid: nutritionAssessment');
    if (typeof workoutAssessment !== 'string')
        throw new Error('AI response missing or invalid: workoutAssessment');
    if (!Array.isArray(recommendations) || recommendations.length === 0)
        throw new Error('AI response missing or invalid: recommendations (must be a non-empty array)');
    recommendations.forEach((item, i) => {
        if (!item.type || !item.priority || !item.change || !item.reason)
            throw new Error(`AI recommendations[${i}] is missing one or more required fields: type, priority, change, reason`);
    });
    if (!actions || typeof actions !== 'object')
        throw new Error('AI response missing or invalid: actions');
    if (actions.caloricTargetAdjustment !== null && typeof actions.caloricTargetAdjustment !== 'number')
        throw new Error('AI response missing or invalid: actions.caloricTargetAdjustment (must be a number or null)');
    if (!Array.isArray(actions.exerciseAdjustments))
        throw new Error('AI response missing or invalid: actions.exerciseAdjustments (must be an array)');

    // ── STEP 6 ── save recommendation to DB ─────────────────────────────────
    const saved = await AiRecommendationsModel.create({
        userId,
        weightAssessment,
        nutritionAssessment,
        workoutAssessment,
        recommendations
    });

    // ── STEP 7 ── apply caloric target adjustment ────────────────────────────
    const { caloricTargetAdjustment, exerciseAdjustments } = actions;

    if (caloricTargetAdjustment !== null && caloricTargetAdjustment !== 0) {
        const newCaloricTarget = Math.round(profile.caloricTarget + caloricTargetAdjustment);

        await ProfilesModel.update(userId, { caloricTarget: newCaloricTarget });
        console.log(`AI adjusted caloric target for user ${userId}: ${profile.caloricTarget} → ${newCaloricTarget} kcal`);

        if (activeMealPlan) {
            const newMealPlanCalories = Math.round(activeMealPlan.targetCalories + caloricTargetAdjustment);
            const ratio = newMealPlanCalories / activeMealPlan.targetCalories; // ← correct base

            for (const meal of activeMealPlan.meals) {
                for (const item of meal.foodItems) {
                    const newQuantity = Math.round(item.quantityGrams * ratio * 10) / 10;
                    await DailyMealPlansModel.updateMealFoodItem(item.id, {
                        quantityGrams: newQuantity
                    });
                }

                const newEstimatedCalories = Math.round(meal.estimatedCalories * ratio);
                await DailyMealPlansModel.updateMeal(meal.mealId, {
                    estimatedCalories: newEstimatedCalories
                });
            }

            await DailyMealPlansModel.update(activeMealPlan.dailyMealPlanId, {
                targetCalories: newCaloricTarget
            });

            console.log(`AI scaled meal plan ${activeMealPlan.dailyMealPlanId} for user ${userId}: ${profile.caloricTarget} → ${newCaloricTarget} kcal (ratio: ${ratio.toFixed(3)})`);
        }
    }

    // ── STEP 8 ── apply exercise adjustments ────────────────────────────────
    for (const adj of exerciseAdjustments) {
        const updateData = {};
        if (adj.newTargetSets   !== undefined) updateData.targetSets   = adj.newTargetSets;
        if (adj.newTargetReps   !== undefined) updateData.targetReps   = adj.newTargetReps;
        if (adj.newTargetWeight !== undefined) updateData.targetWeight  = adj.newTargetWeight;

        if (Object.keys(updateData).length > 0) {
            const updated = await WorkoutPlansModel.updateDayExercise(adj.planExerciseId, updateData);
            if (updated) {
                console.log(`AI updated planExercise ${adj.planExerciseId} for user ${userId}:`, updateData);
            } else {
                console.warn(`AI tried to update planExercise ${adj.planExerciseId} but it was not found`);
            }
        }
    }

    // ── STEP 9 ── return ─────────────────────────────────────────────────────
    return {
        ...saved,
        actionsApplied: {
            caloricTargetAdjustment: caloricTargetAdjustment ?? null,
            exerciseAdjustmentsCount: exerciseAdjustments.length
        }
    };
};

module.exports = { analyzeProgress };
