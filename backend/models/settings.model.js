// Per-user settings — mirrors the users mock data
let settingsModel = [
    { userId: 1, displayName: 'John Doe',       email: 'john@fitwize.com',  theme: 'light', fitnessGoal: 'muscle gain', activityLevel: 1 },
    { userId: 2, displayName: 'Noam Levi',       email: 'noam@fitwize.com',  theme: 'dark',  fitnessGoal: 'fat loss',    activityLevel: 4 },
    { userId: 3, displayName: 'Dana Cohen',      email: 'dana@fitwize.com',  theme: 'light', fitnessGoal: 'muscle gain', activityLevel: 3 },
    { userId: 4, displayName: 'Yossi Mizrahi',   email: 'yossi@fitwize.com', theme: 'light', fitnessGoal: 'weight loss', activityLevel: 2 },
    { userId: 5, displayName: 'Maya Ben-David',  email: 'maya@fitwize.com',  theme: 'light', fitnessGoal: 'maintenance', activityLevel: 5 },
    { userId: 6, displayName: 'Eitan Katz',      email: 'eitan@fitwize.com', theme: 'dark',  fitnessGoal: 'fat loss',    activityLevel: 1 }
];

module.exports = settingsModel;
