// here we fetch the data from the models as a list
const usersController = require('../models/users.model');
// function to get all the users and its response JSON
const getAllUsers = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: usersController,
            error: null
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};
// here we fetch by userId and its JSON response if he didn't find it
const getUserById = (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // validation for id
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid id",
                    details: {
                        field: "id"
                    }
                }
            });
        }

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

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};
// a function to create a new user profile
const createUser = (req, res) => {
    try {
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

        // we create the new user with the new id
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

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};
// a function to update user's details
const updateUser = (req, res) => {
    try {
        // we get the user id as a string and convert it to a int
        const id = parseInt(req.params.id);

        // validation for id
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid id",
                    details: {
                        field: "id"
                    }
                }
            });
        }

        // we search the user in the mock DB
        const user = usersController.find(u => u.userid === id);

        // if user is not found
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
        // we get the data that the user sent
        const { firstName, lastName, userRole, age, gender, height,
            weight, activityLevel, fitnessGoal, preferences } = req.body;

        // we do a validation for the data
        const requiredFields = ["firstName", "lastName", "userRole",
            "age", "gender", "height", "weight", "activityLevel", "fitnessGoal"];
        // if something isn't vaild
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

        // we update the user data
        user.firstName = firstName;
        user.lastName = lastName;
        user.userRole = userRole;
        user.age = age;
        user.gender = gender;
        user.height = height;
        user.weight = weight;
        user.activityLevel = activityLevel;
        user.fitnessGoal = fitnessGoal;
        user.preferences = preferences;
        user.updateDate = new Date();

        // return success status
        res.status(200).json({
            success: true,
            data: user,
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};
// a function to delete user
const deleteUser = (req, res) => {
    try {
        // we get the user id as a string and convert it to a int
        const id = parseInt(req.params.id);

        // validation for id
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid id",
                    details: {
                        field: "id"
                    }
                }
            });
        }

        // we look for the requested user's index (in order to delete
        // from the array we need the specific index)
        const userIndex = usersController.findIndex(u => u.userid === id);

        // if index not found
        if (userIndex === -1) {
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

        // we delete the user from the array using splice
        // (from were to delete, and how many cells)
        const deletedUser = usersController.splice(userIndex, 1);

        res.status(200).json({
            success: true,
            data: deletedUser[0],
            error: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                details: {}
            }
        });
    }
};
// we export those function so other files can use them
module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};