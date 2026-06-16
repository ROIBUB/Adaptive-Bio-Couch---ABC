const { GoogleGenerativeAI } = require('@google/generative-ai');
const WorkoutPlansModel   = require('../models/workoutPlans.model');
const DailyMealPlansModel = require('../models/dailyMealPlans.model');
const ExercisesModel      = require('../models/exercises.model');
const FoodItemsModel      = require('../models/foodItems.model');

const generatePlan = async (profile) => {
    const { userId, firstName, age, gender, height, currentWeight, fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay } = profile;

    // ── BMR (Mifflin-St Jeor) ──
    const bmrMale   = 10 * currentWeight + 6.25 * height - 5 * age + 5;
    const bmrFemale = 10 * currentWeight + 6.25 * height - 5 * age - 161;
    const bmr = gender === 'male'   ? bmrMale
              : gender === 'female' ? bmrFemale
              : (bmrMale + bmrFemale) / 2;

    // ── Activity multiplier ──
    const multipliers = { beginner: 1.375, intermediate: 1.55, advanced: 1.725 };
    const tdee = bmr * (multipliers[activityLevel] || 1.375);

    // ── Goal adjustment ──
    let caloricTarget;
    if (fitnessGoal === 'weight_loss')      caloricTarget = Math.round(tdee - 500);
    else if (fitnessGoal === 'muscle_gain') caloricTarget = Math.round(tdee + 300);
    else                                    caloricTarget = Math.round(tdee);

    // ── Fetch exercises and food items from DB ──
    const [exercises, foodItems] = await Promise.all([
        ExercisesModel.getAll(),
        FoodItemsModel.getAll()
    ]);

    // ── Build prompt ──
    const exerciseRows = exercises
        .map(e => `${e.exerciseId} | ${e.name} | ${e.muscleGroup ?? ''} | ${e.difficultyLevel ?? ''} | ${e.equipment ?? ''}`)
        .join('\n');

    const foodRows = foodItems
        .map(f => `${f.foodItemId} | ${f.name} | ${f.caloriesPer100g} | ${f.proteinPer100g ?? 0} | ${f.category ?? ''}`)
        .join('\n');

    const prompt = `You are a certified fitness and nutrition expert. Generate a personalized workout plan and meal plan for this user.

USER:
- Name: ${firstName}
- Fitness goal: ${fitnessGoal}
- Activity level: ${activityLevel}
- Workouts per week: ${workoutsPerWeek}
- Meals per day: ${mealsPerDay}
- Daily caloric target: ${caloricTarget} kcal
- Age: ${age}
- Gender: ${gender}
- Current weight: ${currentWeight} kg

AVAILABLE EXERCISES — use ONLY these IDs (columns: id | name | muscle_group | difficulty | equipment):
${exerciseRows}

AVAILABLE FOOD ITEMS — use ONLY these IDs (columns: id | name | calories_per_100g | protein_per_100g | category):
${foodRows}

STRICT REQUIREMENTS:
1. Respond with ONLY raw JSON. No markdown, no code fences, no backticks, no extra text.
2. workoutPlan.days must have EXACTLY ${workoutsPerWeek} entries.
3. mealPlan.meals must have EXACTLY ${mealsPerDay} entries.
4. Each "day" value must be one of: Sunday Monday Tuesday Wednesday Thursday Friday Saturday — no duplicates. Distribute evenly across the week (e.g. Monday/Wednesday/Friday for 3 days).
5. Each "mealType" value must be one of: Breakfast Lunch Dinner Snack.
6. Only use exerciseId and foodItemId values from the lists above — no others.
7. Each day must have 3–5 exercises. Each meal must have 2–4 food items.
8. targetWeight values must be realistic for the user's activity level (${activityLevel}) and gender (${gender}).

Return exactly this JSON shape and nothing else:
{
  "workoutPlan": {
    "days": [
      {
        "day": "Monday",
        "workoutTitle": "Upper Body",
        "exercises": [
          { "exerciseId": 2, "exerciseName": "Chest Press", "targetSets": 3, "targetReps": 12, "targetWeight": 20 }
        ]
      }
    ]
  },
  "mealPlan": {
    "targetProtein": 130,
    "meals": [
      {
        "mealType": "Breakfast",
        "title": "Morning Protein Bowl",
        "estimatedCalories": 450,
        "estimatedProtein": 35,
        "foodItems": [
          { "foodItemId": 5, "foodName": "Egg", "quantityGrams": 150 }
        ]
      }
    ]
  }
}`;

    // ── Call Gemini ──
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set in environment variables');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const geminiResult = await model.generateContent(prompt);
    const raw = geminiResult.response.text();

    // ── Parse and validate ──
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    let aiResponse;
    try {
        aiResponse = JSON.parse(cleaned);
    } catch (err) {
        throw new Error(`Failed to parse Gemini response as JSON: ${err.message}\nRaw output: ${cleaned.slice(0, 500)}`);
    }

    const exerciseIdSet = new Set(exercises.map(e => e.exerciseId));
    const foodItemIdSet = new Set(foodItems.map(f => f.foodItemId));

    for (const day of aiResponse.workoutPlan.days) {
        for (const ex of day.exercises) {
            if (!exerciseIdSet.has(ex.exerciseId)) {
                throw new Error(`Gemini returned unknown exerciseId: ${ex.exerciseId}`);
            }
        }
    }
    for (const meal of aiResponse.mealPlan.meals) {
        for (const fi of meal.foodItems) {
            if (!foodItemIdSet.has(fi.foodItemId)) {
                throw new Error(`Gemini returned unknown foodItemId: ${fi.foodItemId}`);
            }
        }
    }

    // ── Write workout plan to DB ──
    const newPlan = await WorkoutPlansModel.create({
        userId,
        name: `${firstName} - ${fitnessGoal} Workout Plan`,
        goal: fitnessGoal,
        isActive: true
    });

    for (const dayData of aiResponse.workoutPlan.days) {
        const newDay = await WorkoutPlansModel.createDay({
            workoutPlanId: newPlan.workoutPlanId,
            day: dayData.day,
            title: dayData.workoutTitle
        });

        for (const ex of dayData.exercises) {
            await WorkoutPlansModel.createDayExercise({
                workoutDayId: newDay.workoutDayId,
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                targetWeight: ex.targetWeight
            });
        }
    }

    const assignedWorkoutPlanId = newPlan.workoutPlanId;

    // ── Write meal plan to DB ──
    const newMealPlan = await DailyMealPlansModel.create({
        userId,
        name: `${firstName} - ${fitnessGoal} Meal Plan`,
        goal: fitnessGoal,
        targetCalories: caloricTarget,
        targetProtein: aiResponse.mealPlan.targetProtein,
        isActive: true
    });

    for (const mealData of aiResponse.mealPlan.meals) {
        const newMeal = await DailyMealPlansModel.createMeal({
            dailyMealPlanId: newMealPlan.dailyMealPlanId,
            mealType: mealData.mealType,
            title: mealData.title,
            estimatedCalories: mealData.estimatedCalories,
            estimatedProtein: mealData.estimatedProtein
        });

        for (const fi of mealData.foodItems) {
            await DailyMealPlansModel.createMealFoodItem({
                mealId: newMeal.mealId,
                foodItemId: fi.foodItemId,
                foodName: fi.foodName,
                quantityGrams: fi.quantityGrams
            });
        }
    }

    const assignedMealPlanId = newMealPlan.dailyMealPlanId;

    return { caloricTarget, assignedWorkoutPlanId, assignedMealPlanId };
};

module.exports = { generatePlan };
