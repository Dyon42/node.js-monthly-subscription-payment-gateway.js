const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const keys = require('./keys');
const { User, createUser, comparePassword, getUserByEmail, getUserById } = require('../models/user-model');



// google login
passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        console.log(profile)
        // check if user already exists in our own db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    thumbnail: profile._json.image.url,
                    premiumTimer:123
                }).save().then((newUser) => {
                    console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);

//facebook login
passport.use(new FacebookStrategy({
    clientID: "323949915086517",
    clientSecret: "f1d6771d751e714d0ebb7c74ef88218e",
    callbackURL: "/auth/facebook/redirect"
  },
  function(accessToken, refreshToken, profile, done) {
      //console.log(profile)
    //check if user already exists in our own db
    User.findOne({facebbookId: profile.id}).then((currentUser) => {
        if(currentUser){
            // already have this user
            console.log('user is: ', currentUser);
            done(null, currentUser);
        } else {
            // if not, create user in our db
            new User({
                facebookId: profile.id,
                username: profile.displayName,
            }).save().then((newUser) => {
                console.log('created new user: ', newUser);
                done(null, newUser);
            });
        }
    });
}
))

//local login 
passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback : true
},
	function(req, email, password, done) {
		getUserByEmail(email, function(err, user) {
			if (err) { return done(err); }
	  		if (!user) {
                  console.log("email is not found")
				return done(null, false, req.flash('error_message', 'No email is found'));
	  		}
	  		comparePassword(password, user.password, function(err, isMatch) {
                console.log("checking passowrd")
				if (err) { return done(err); }
				if(isMatch){
                    console.log("succes")
		  				return done(null, user, req.flash('success_message', 'You have successfully logged in!!'));
				}
				else{
		  				return done(null, false, req.flash('error_message', 'Incorrect Password'));
				}
	 		});
		});
  	}
));