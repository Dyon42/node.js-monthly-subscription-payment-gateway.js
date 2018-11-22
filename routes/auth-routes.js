const router = require('express').Router();
const flash = require('connect-flash');
const passport = require('passport');
const { User, createUser, comparePassword, getUserByEmail, getUserById } = require('../models/user-model');

// auth login
router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

router.get('/locallogin', (req, res) => {
    res.render('locallogin', { user: req.user });
});

router.get('/localregister', function(req, res){
    res.render('localregister');
});

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth with google+
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: []
    })
);

router.post('/localregister', function(req, res){
    let name = req.body.name;
    console.log("register console log", name)
  let email = req.body.email;
  let password = req.body.password;
  let cfm_pwd = req.body.cfm_pwd;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Please enter a valid email').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('cfm_pwd', 'Confirm Password is required').notEmpty();
  req.checkBody('cfm_pwd', 'Confirm Password Must Matches With Password').equals(password);

  let errors = req.validationErrors();
  if(errors)
  {
      res.render('localregister',{errors: errors});
  }
  else
  {
      let user = new User({
      username: name,
      email: email,
      password: password
      });
      User.findOne({email: user.email}).then((currentUser) => {
        if(currentUser){
        res.redirect('../localregister')
        }
        else{
      createUser(user, function(err, user){
        res.redirect('../locallogin')
          if(err) throw err;
          else console.log(user);
      });
      req.flash('success_message','You have registered, Now please login');
    
  }
})}})

// router.post('/locallogin', passport.authenticate('local', {
// 	failureRedirect: '/auth/locallogin', failureFlash: true
// 	}), 
// 	function(req, res,done){
// 		req.flash('success_message', 'You are now Logged in!!');
//           res.redirect('/profile');
       
// 	}
// );
router.post('/locallogin', 
  passport.authenticate('local', { failureRedirect: '/profile' }),
  function(req, res) {
    res.redirect('/profile');
  });


// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    // res.send(req.user);
    res.redirect('/profile');
});


router.get('/facebook/redirect',
 passport.authenticate('facebook', { successRedirect: '/profile',
                                      failureRedirect: '/login' }));
module.exports = router;

