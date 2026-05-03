const express = require('express');
const router = express.Router();

const { getAllUsers, getUserById, createUser } = require('../controllers/users.controller');
// if u asked for GET /api/users
router.get('/', getAllUsers);
// if u asked for GET /api/users/:id
router.get('/:id', getUserById);
// if u asked for POST /api/users
router.post('/', createUser);

module.exports = router;