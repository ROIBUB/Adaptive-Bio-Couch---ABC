const profilesController = require('../models/profiles.model');

const getAllProfiles = (req, res) => {
    res.status(200).json({
        success: true,
        data: profilesController,
        error: null
    });
};

const getProfileById = (req, res) => {
    const id = parseInt(req.params.userid);

    const profile = profiles.find(p => p.userid === id);

    if (!profile) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "Profile not found",
                details: {}
            }
        });
    }

    res.status(200).json({
        success: true,
        data: profile,
        error: null
    });
};
module.exports = {
    getAllProfiles,
    getProfileById
};