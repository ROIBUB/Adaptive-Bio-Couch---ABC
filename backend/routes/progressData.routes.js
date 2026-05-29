const express = require('express');
const router = express.Router();
const { getAllProgress, getProgressByDate, createProgress, updateProgress } = require('../controllers/progressData.controller');

router.get('/', getAllProgress);
router.get('/:date', getProgressByDate);
router.post('/', createProgress);
router.put('/:id', updateProgress);

module.exports = router;
