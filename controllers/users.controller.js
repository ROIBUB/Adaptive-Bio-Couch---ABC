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
// we export those function so other files can use them
module.exports = {
    getAllUsers,
    getUserById
};