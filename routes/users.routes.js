const express = require('express');
const router = express.Router();

const { getAllUsers, getUserById, createUser, updateUser, deleteUser} = require('../controllers/users.controller');
// if u asked for GET /api/users
router.get('/', getAllUsers);
// if u asked for GET /api/users/:id
router.get('/:id', getUserById);
// if u asked for POST /api/users
router.post('/', createUser);
// if u asked for PUT /api/users/:id
router.put('/:id', updateUser);
// if u asked for DELETE /api/users/:id
router.delete('/:id', deleteUser);
module.exports = router;