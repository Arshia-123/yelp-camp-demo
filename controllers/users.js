//models

const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body
        //Create basic user model instance
        const user = new User({ email, username })
        //Now generate a hashed password and actually submit it to the database
        const registeredUser = await User.register(user, password)
        console.log(`New User: ${registeredUser}`);
        //Log user in after signup using Passport middleware
        req.login(registeredUser, err => {
            //Go to next error handler mw
            if (err) { return next(err); }
            //If not continue and redirect
            req.flash(`success`, `Welcome to YelpCamp ${registeredUser.username}!`)
            res.redirect('/campgrounds')
        })
    } catch (e) {
        //we do this to be able to display the error message to the user
        req.flash(`error`, e.message)
        //Redirect back so they think they are in the same place
        return res.redirect('/register')
    }

}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    //Passport does everytign with the authenticate middleware so we can just do the flashes and redirects (it also creates a session)
    req.flash(`success`, `Welcome back ${req.user.username}!`)
    //Storing redirect to and using it to either send user to homepage or back to where they were after login, this has an issue with passport 0.5 + so we npm i passport@0.5.0 to make it work
    const redirectUrl = req.session.returnTo || `/campgrounds`
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => {
    //Using Passport's logout middleware
    req.logout()
    req.flash('success', "Logged you out");
    res.redirect('/campgrounds');
}