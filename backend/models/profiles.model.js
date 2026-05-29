let profiles = [
    { profileId: 1, userId: 1, age: 25, gender: 'male',   height: 175, currentWeight: 75, targetWeight: 72, fitnessGoal: 'muscle_gain',  activityLevel: 'intermediate', workoutsPerWeek: 4, mealsPerDay: 4, onboardingCompleted: true },
    { profileId: 2, userId: 2, age: 28, gender: 'male',   height: 180, currentWeight: 82, targetWeight: 78, fitnessGoal: 'fat_loss',     activityLevel: 'advanced',     workoutsPerWeek: 5, mealsPerDay: 4, onboardingCompleted: true },
    { profileId: 3, userId: 3, age: 24, gender: 'female', height: 165, currentWeight: 60, targetWeight: 58, fitnessGoal: 'muscle_gain',  activityLevel: 'intermediate', workoutsPerWeek: 3, mealsPerDay: 5, onboardingCompleted: true },
    { profileId: 4, userId: 4, age: 35, gender: 'male',   height: 175, currentWeight: 90, targetWeight: 82, fitnessGoal: 'weight_loss',  activityLevel: 'beginner',     workoutsPerWeek: 3, mealsPerDay: 3, onboardingCompleted: true },
    { profileId: 5, userId: 5, age: 22, gender: 'female', height: 170, currentWeight: 58, targetWeight: 58, fitnessGoal: 'maintenance',  activityLevel: 'advanced',     workoutsPerWeek: 5, mealsPerDay: 5, onboardingCompleted: true },
    { profileId: 6, userId: 6, age: 30, gender: 'male',   height: 178, currentWeight: 85, targetWeight: 80, fitnessGoal: 'fat_loss',     activityLevel: 'beginner',     workoutsPerWeek: 3, mealsPerDay: 3, onboardingCompleted: true }
];

const getByUserId = (userId) => profiles.find(p => p.userId === userId) || null;

const create = (data) => {
    const newProfile = {
        profileId: profiles.length > 0 ? profiles[profiles.length - 1].profileId + 1 : 1,
        ...data
    };
    profiles.push(newProfile);
    return newProfile;
};

const update = (userId, data) => {
    const index = profiles.findIndex(p => p.userId === userId);
    if (index === -1) return null;
    profiles[index] = { ...profiles[index], ...data };
    return profiles[index];
};

module.exports = { getByUserId, create, update };
