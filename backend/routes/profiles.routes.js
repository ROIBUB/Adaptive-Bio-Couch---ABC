const express = require('express');
const router = express.Router();
const { getProfileByUserId, createProfile, updateProfile } = require('../controllers/profiles.controller');

router.get('/:userId', getProfileByUserId);
router.post('/', createProfile);
router.put('/:userId', updateProfile);

module.exports = router;
