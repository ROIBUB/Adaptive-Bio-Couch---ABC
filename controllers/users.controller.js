// here we fetch the data from the models as a list
const usersController = require('../models/users.model');
// function to get all the users and its response JSON
const getAllUsers = (req, res) => {
    res.status(200).json({
        success: true,
        data: usersController,
        error: null
    });
};
// here we fetch by userId and its JSON response if he didn't find it
const getUserById = (req, res) => {
    const id = parseInt(req.params.id);

    const user = usersController.find(p => p.userid === id);

    if (!user) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "User not found",
                details: {}
            }
        });
    }
    // if he did find
    res.status(200).json({
        success: true,
        data: user,
        error: null
    });
};
// a function to create a new user profile
const createUser = (req, res) => {
    // how the data comes from the user
    const {firstName, lastName, userRole, age, gender, height,
        weight, activityLevel, fitnessGoal, preferences} = req.body;

    // validation test to all the fields
    const requiredFields = ["firstName", "lastName", "userRole",
        "age", "gender", "height", "weight", "activityLevel", "fitnessGoal"];

    for (let field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: `Missing required field: ${field}`,
                    details: {
                        field: field
                    }
                }
            });
        }
    }

    // here we create a new id
    const newId = usersController.length > 0
        ? usersController[usersController.length - 1].userid + 1
        : 1;

    // יצירת פרופיל חדש
    const newUser = {userid: newId, firstName, lastName, userRole, age,
        gender, height, weight, activityLevel, fitnessGoal, preferences,
        createDate: new Date(), updateDate: new Date()
    };

    // we add the user to the mock DB
    usersController.push(newUser);

    // success status
    res.status(201).json({
        success: true,
        data: newUser,
        error: null
    });
};
// we export those function so other files can use them
module.exports = {
    getAllUsers,
    getUserById,
    createUser
};