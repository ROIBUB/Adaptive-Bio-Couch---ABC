const WorkoutPlansModel = require('../models/workoutPlans.model');
const DailyMealPlansModel = require('../models/dailyMealPlans.model');

// AI STUB — replace this function body with an AI API call when the model is ready.
//
// CONTRACT — this function must always receive and return the following shape,
// regardless of whether the implementation is a stub or a live AI model:
//
// INPUT (profile object):
//   userId          {number}  - the new user's ID (assigned as owner of the copied plans)
//   firstName       {string}  - user's first name (used to name the copied plans)
//   age             {number}  - user age in years
//   gender          {string}  - 'male' | 'female' | 'other'
//   height          {number}  - height in cm
//   currentWeight   {number}  - weight in kg
//   fitnessGoal     {string}  - 'weight_loss' | 'muscle_gain' | 'maintenance'
//   activityLevel   {string}  - 'beginner' | 'intermediate' | 'advanced'
//   workoutsPerWeek {number}  - preferred sessions per week (1–7)
//
// OUTPUT (plain object):
//   caloricTarget         {number}  - daily calorie target in kcal (integer)
//   assignedWorkoutPlanId {number}  - ID of the NEWLY CREATED user-owned copy, not the template
//   assignedMealPlanId    {number}  - ID of the NEWLY CREATED user-owned copy, not the template
//
// The controller that calls this function will pass the output directly into
// ProfilesModel.update — do not change the field names.

const generatePlan = (profile) => {
    const { userId, firstName, age, gender, height, currentWeight, fitnessGoal, activityLevel, workoutsPerWeek } = profile;

    // ── Mifflin-St Jeor BMR ──
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

    // STUB: plans are selected from a fixed lookup table based on goal and frequency.
    // The AI version will generate plans dynamically — replace the lookup below with the AI call.

    // ── Workout template lookup ──
    let templateWorkoutId;
    if (fitnessGoal === 'muscle_gain')      templateWorkoutId = workoutsPerWeek <= 3 ? 1 : 2;
    else if (fitnessGoal === 'weight_loss') templateWorkoutId = workoutsPerWeek <= 3 ? 3 : 4;
    else                                    templateWorkoutId = workoutsPerWeek <= 3 ? 5 : 6;

    // ── Meal template lookup ──
    let templateMealId;
    if (fitnessGoal === 'muscle_gain')      templateMealId = caloricTarget >= 2500 ? 1 : 2;
    else if (fitnessGoal === 'weight_loss') templateMealId = caloricTarget >= 1700 ? 3 : 4;
    else                                    templateMealId = caloricTarget >= 2300 ? 5 : 6;

    // ── Deep copy: workout plan ──
    const template = WorkoutPlansModel.getById(templateWorkoutId);

    const newPlan = WorkoutPlansModel.create({
        userId,
        name: `${firstName} - ${fitnessGoal} Workout Plan`,
        goal: fitnessGoal,
        isActive: true
    });

    for (const templateDay of template.days) {
        const newDay = WorkoutPlansModel.createDay({
            workoutPlanId: newPlan.workoutPlanId,
            day: templateDay.day,
            title: templateDay.title
        });

        for (const exercise of templateDay.exercises) {
            WorkoutPlansModel.createDayExercise({
                workoutDayId: newDay.workoutDayId,
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName,
                targetSets: exercise.targetSets,
                targetReps: exercise.targetReps,
                targetWeight: exercise.targetWeight
            });
        }
    }

    const assignedWorkoutPlanId = newPlan.workoutPlanId;

    // ── Deep copy: meal plan ──
    const mealTemplate = DailyMealPlansModel.getById(templateMealId);

    const newMealPlan = DailyMealPlansModel.create({
        userId,
        name: `${firstName} - ${fitnessGoal} Meal Plan`,
        goal: fitnessGoal,
        targetCalories: caloricTarget,
        targetProtein: mealTemplate.targetProtein,
        isActive: true
    });

    for (const templateMeal of mealTemplate.meals) {
        const newMeal = DailyMealPlansModel.createMeal({
            dailyMealPlanId: newMealPlan.dailyMealPlanId,
            mealType: templateMeal.mealType,
            title: templateMeal.title,
            estimatedCalories: templateMeal.estimatedCalories,
            estimatedProtein: templateMeal.estimatedProtein
        });

        for (const fi of templateMeal.foodItems) {
            DailyMealPlansModel.createMealFoodItem({
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
