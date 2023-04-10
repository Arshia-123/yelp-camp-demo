const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')

//Controller
const users = require('../controllers/users')

//Register custom route

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));


router.route('/login')
    .get(users.renderLogin)
    //Using custom Passport Js middleware for logging in. We give it flash as true so it flashes messages on error and redirects on error, failureFlash uses our custom partials since it uses the flash module
    .post(passport.authenticate(`local`, { failureFlash: true, failureRedirect: `/login` }), users.login);


router.get('/logout',
    users.logout
);

module.exports = router;