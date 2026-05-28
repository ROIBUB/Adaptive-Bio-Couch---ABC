const express = require('express');
const router = express.Router();

const authorize = require("../middleware/auth");
const { getAllUsers, getUserById, getMe, createUser, updateUser, deleteUser} = require('../controllers/users.controller');

// if u asked for GET /api/users
router.get('/', getAllUsers);
// /me MUST come before /:id — otherwise "me" is captured as an id param
router.get('/me', getMe);
// if u asked for GET /api/users/:id
router.get('/:id', getUserById);
// if u asked for POST /api/users only for admin
router.post('/' , authorize(['admin']), createUser);
// if u asked for PUT /api/users/:id only for admin
router.put('/:id' , authorize(['admin']), updateUser);
// if u asked for DELETE /api/users/:id only for admin
router.delete('/:id' , authorize(['admin']), deleteUser);
module.exports = router;

