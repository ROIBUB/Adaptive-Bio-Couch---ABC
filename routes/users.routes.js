const express = require('express');
const router = express.Router();

const authorize = require("../middleware/auth");
const { getAllUsers, getUserById, createUser, updateUser, deleteUser} = require('../controllers/users.controller');

// if u asked for GET /api/users
router.get('/', getAllUsers);
// if u asked for GET /api/users/:id
router.get('/:id', getUserById);
// if u asked for POST /api/users only for admin
router.post('/' , authorize(['admin']), createUser);
// if u asked for PUT /api/users/:id only for admin
router.put('/:id' , authorize(['admin']), updateUser);
// if u asked for DELETE /api/users/:id only for admin
router.delete('/:id' , authorize(['admin']), deleteUser);
module.exports = router;

