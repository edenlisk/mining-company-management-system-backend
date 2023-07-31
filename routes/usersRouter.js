const express = require('express');
const router = express.Router();
const { getAllUsers, getOneUser, updateUser, deleteUser} = require('../controllers/usersControllers');
const { signup, login, logout } = require('../controllers/authControllers');

router.route('/')
    .get(getAllUsers)

router.route('/:userId')
    .get(getOneUser)
    .patch(updateUser)
    .delete(deleteUser)

router.route('/signup')
    .post(signup)

router.route('/login')
    .post(login)

router.route('/logout')
    .post(logout)

module.exports = router;
