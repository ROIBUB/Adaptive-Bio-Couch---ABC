const express = require('express');
const router = express.Router();

const authorize = require('../middleware/auth');

const {
    getAllExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise
} = require('../controllers/exercises.controller');

// GET /api/exercises
router.get('/', getAllExercises);

// GET /api/exercises/:id
router.get('/:id', getExerciseById);

// POST /api/exercises
router.post('/', authorize(['admin']), createExercise);

// PUT /api/exercises/:id
router.put('/:id', authorize(['admin']), updateExercise);

// DELETE /api/exercises/:id
router.delete('/:id', authorize(['admin']), deleteExercise);

module.exports = router;