// here we fetch the data from the models as a list
const usersController = require('../models/users.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require("../middleware/errorHandlers");

const {
    validateId,
    getMissingFields,
    validatePositiveNumericFields
} = require("../middleware/validation");

// function to get all the users and its response JSON
const getAllUsers = (req, res) => {
    try {
        return sendSuccess(res, 200, usersController);

    } catch (err) {
        return sendServerError(res);
    }
};

// here we fetch by userId and its JSON response if he didn't find it
const getUserById = (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // validation for id
        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        const user = usersController.find(
            p => p.userid === id
        );

        if (!user) {
            return sendNotFound(
                res,
                "User not found",
                {}
            );
        }

        // if he did find
        return sendSuccess(res, 200, user);

    } catch (err) {
        return sendServerError(res);
    }
};

// a function to create a new user profile
const createUser = (req, res) => {
    try {

        // how the data comes from the user
        const {
            firstName,
            lastName,
            userRole,
            age,
            gender,
            height,
            weight,
            activityLevel,
            fitnessGoal,
            preferences
        } = req.body;

        // validation test to all the fields
        const requiredFields = [
            "firstName",
            "lastName",
            "userRole",
            "age",
            "gender",
            "height",
            "weight",
            "activityLevel",
            "fitnessGoal"
        ];

        const missingFields = getMissingFields(
            req.body,
            requiredFields
        );

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required user fields",
                {
                    missingFields: missingFields
                }
            );
        }

        // validation for numeric fields
        const numericFields = [
            "age",
            "height",
            "weight",
            "activityLevel"
        ];

        const invalidNumericFields =
            validatePositiveNumericFields(
                req.body,
                numericFields
            );

        if (invalidNumericFields.length > 0) {
            return sendValidationError(
                res,
                "Invalid numeric fields",
                {
                    invalidFields: invalidNumericFields
                }
            );
        }

        // validation for gender
        const allowedGenders = [
            "male",
            "female"
        ];

        if (!allowedGenders.includes(gender)) {
            return sendValidationError(
                res,
                "Invalid gender",
                {
                    field: "gender",
                    allowedValues: allowedGenders,
                    value: gender
                }
            );
        }

        // validation for user role
        const allowedRoles = [
            "user",
            "admin"
        ];

        if (!allowedRoles.includes(userRole)) {
            return sendValidationError(
                res,
                "Invalid user role",
                {
                    field: "userRole",
                    allowedValues: allowedRoles,
                    value: userRole
                }
            );
        }

        // here we create a new id
        const newId =
            usersController.length > 0
                ? usersController[
            usersController.length - 1
                ].userid + 1
                : 1;

        // we create the new user with the new id
        const newUser = {
            userid: newId,
            firstName,
            lastName,
            userRole,
            age,
            gender,
            height,
            weight,
            activityLevel,
            fitnessGoal,
            preferences,
            createDate: new Date(),
            updateDate: new Date()
        };

        // we add the user to the mock DB
        usersController.push(newUser);

        // success status
        return sendSuccess(
            res,
            201,
            newUser
        );

    } catch (err) {
        return sendServerError(res);
    }
};

// a function to update user's details
const updateUser = (req, res) => {
    try {

        // we get the user id as a string and convert it to a int
        const id = parseInt(req.params.id);

        // validation for id
        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        // we search the user in the mock DB
        const user = usersController.find(
            u => u.userid === id
        );

        // if user is not found
        if (!user) {
            return sendNotFound(
                res,
                "User not found",
                {}
            );
        }

        // we get the data that the user sent
        const {
            firstName,
            lastName,
            userRole,
            age,
            gender,
            height,
            weight,
            activityLevel,
            fitnessGoal,
            preferences
        } = req.body;

        // we do a validation for the data
        const requiredFields = [
            "firstName",
            "lastName",
            "userRole",
            "age",
            "gender",
            "height",
            "weight",
            "activityLevel",
            "fitnessGoal"
        ];

        const missingFields = getMissingFields(
            req.body,
            requiredFields
        );

        if (missingFields.length > 0) {
            return sendValidationError(
                res,
                "Missing required user fields",
                {
                    missingFields: missingFields
                }
            );
        }

        // validation for numeric fields
        const numericFields = [
            "age",
            "height",
            "weight",
            "activityLevel"
        ];

        const invalidNumericFields =
            validatePositiveNumericFields(
                req.body,
                numericFields
            );

        if (invalidNumericFields.length > 0) {
            return sendValidationError(
                res,
                "Invalid numeric fields",
                {
                    invalidFields: invalidNumericFields
                }
            );
        }

        // validation for gender
        const allowedGenders = [
            "male",
            "female"
        ];

        if (!allowedGenders.includes(gender)) {
            return sendValidationError(
                res,
                "Invalid gender",
                {
                    field: "gender",
                    allowedValues: allowedGenders,
                    value: gender
                }
            );
        }

        // validation for user role
        const allowedRoles = [
            "user",
            "admin"
        ];

        if (!allowedRoles.includes(userRole)) {
            return sendValidationError(
                res,
                "Invalid user role",
                {
                    field: "userRole",
                    allowedValues: allowedRoles,
                    value: userRole
                }
            );
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
        return sendSuccess(res, 200, user);

    } catch (err) {
        return sendServerError(res);
    }
};

// a function to delete user
const deleteUser = (req, res) => {
    try {

        // we get the user id as a string and convert it to a int
        const id = parseInt(req.params.id);

        // validation for id
        if (!validateId(id)) {
            return sendValidationError(
                res,
                "Invalid id",
                {
                    field: "id",
                    value: req.params.id
                }
            );
        }

        // we look for the requested user's index
        const userIndex =
            usersController.findIndex(
                u => u.userid === id
            );

        // if index not found
        if (userIndex === -1) {
            return sendNotFound(
                res,
                "User not found",
                {}
            );
        }

        // we delete the user from the array
        const deletedUser =
            usersController.splice(
                userIndex,
                1
            );

        return sendSuccess(
            res,
            200,
            deletedUser[0]
        );

    } catch (err) {
        return sendServerError(res);
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