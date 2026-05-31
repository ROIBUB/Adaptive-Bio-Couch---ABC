const express = require('express');
const router = express.Router();
const { getProfileByUserId, createProfile, updateProfile, replanProfile } = require('../controllers/profiles.controller');

router.get('/:userId', getProfileByUserId);
router.post('/', createProfile);
router.put('/:userId', updateProfile);
router.post('/:userId/replan', replanProfile);

module.exports = router;
