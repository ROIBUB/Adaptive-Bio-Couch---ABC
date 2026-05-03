// Array of profiles
let profilesModel = [
    {
        userid: 1,
        firstName: 'John',
        lastName: 'Doe',
        createDate: new Date(),
        updateDate: new Date(),
        userRole: "user",
        age: 25,
        gender: "male",
        height: 175,
        weight: 75,
        activityLevel: 1,
        fitnessGoal: "muscle gain",
        preferences: 5
    },
    {
        userid: 2,
        firstName: 'Noam',
        lastName: 'Levi',
        createDate: new Date(),
        updateDate: new Date(),
        userRole: "admin",
        age: 28,
        gender: "male",
        height: 180,
        weight: 82,
        activityLevel: 4,
        fitnessGoal: "fat loss",
        preferences: 4
    },
    {
        userid: 3,
        firstName: 'Dana',
        lastName: 'Cohen',
        createDate: new Date(),
        updateDate: new Date(),
        userRole: "user",
        age: 24,
        gender: "female",
        height: 165,
        weight: 60,
        activityLevel: 3,
        fitnessGoal: "muscle gain",
        preferences: 5
    },
    {
        userid: 4,
        firstName: 'Yossi',
        lastName: 'Mizrahi',
        createDate: new Date(),
        updateDate: new Date(),
        userRole: "manager",
        age: 35,
        gender: "male",
        height: 175,
        weight: 90,
        activityLevel: 2,
        fitnessGoal: "weight loss",
        preferences: 3
    },
    {
        userid: 5,
        firstName: 'Maya',
        lastName: 'Ben-David',
        createDate: new Date(),
        updateDate: new Date(),
        userRole: "user",
        age: 22,
        gender: "female",
        height: 170,
        weight: 58,
        activityLevel: 5,
        fitnessGoal: "maintenance",
        preferences: 4
    },
    {
        userid: 6,
        firstName: 'Eitan',
        lastName: 'Katz',
        createDate: new Date(),
        updateDate: new Date(),
        userRole: "user",
        age: 30,
        gender: "male",
        height: 178,
        weight: 85,
        activityLevel: 1,
        fitnessGoal: "fat loss",
        preferences: 3
    }
];

module.exports = profilesModel;
// postman -> server -> route -> controller -> model -> data -> response