console.log('Script started');
require('dotenv').config();

console.log('GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY);

let generatePlan;
try {
    generatePlan = require('./services/planGenerator').generatePlan;
    console.log('planGenerator loaded:', typeof generatePlan);
} catch (err) {
    console.error('Failed to require planGenerator:', err.message);
    process.exit(1);
}

const testProfile = {
    userId: 1,
    firstName: 'Test',
    age: 25,
    gender: 'male',
    height: 175,
    currentWeight: 80,
    fitnessGoal: 'muscle_gain',
    activityLevel: 'intermediate',
    workoutsPerWeek: 3
};

generatePlan(testProfile)
    .then(result => {
        console.log('✅ Success:');
        console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
    });