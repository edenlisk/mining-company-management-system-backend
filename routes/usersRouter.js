const express = require('express');
const router = express.Router();
const { getAllUsers, getOneUser, updateUser, deleteUser, getNotifications, updateNotificationStatus} = require('../controllers/usersControllers');
const { signup, login, logout, protect, restrictTo } = require('../controllers/authControllers');

router.route('/')
    .get(protect, getAllUsers)

router.route('/:userId')
    .get(protect, getOneUser)
    .patch(protect, updateUser)
    .delete(protect, deleteUser)

router.route('/notifications/:userId/:notificationId?')
    .get(protect, getNotifications)
    .patch(protect, updateNotificationStatus)


router.route('/signup')
    .post(protect, signup)

router.route('/login')
    .post(login)

router.route('/logout')
    .post(logout)

module.exports = router;
