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
        preferences: 5 // WE WILL DISCUSS IT LATER
    }
];

module.exports = profilesModel;
// postman -> server -> route -> controller -> model -> data -> response