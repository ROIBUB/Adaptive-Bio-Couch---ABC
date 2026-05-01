const express = require('express');
const router = express.Router();

const { getAllProfiles, getProfileById } = require('../controllers/profiles.controller');
router.get('/', getAllProfiles);
router.get('/id', getProfileById);

module.exports = router;