const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('../config/keys');
const { User, createUser, comparePassword, getUserByEmail, getUserById } = require('../models/user-model');

module.exports = (app) =>{

    passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser((id, done) => {
   User.findById(id).then((user) => {
       done(null, user);
   });
});

// set up session cookies
app.use(cookieSession({
   maxAge: 24 * 60 * 60 * 1000,
   keys: [keys.session.cookieKey]
}));

}