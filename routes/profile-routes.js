const router = require('express').Router();

const authCheck = (req, res, next) => {
    if(!req.user){
        
        res.redirect('/auth/login');
    } else {
        
        next();
    }
};

router.get('/', authCheck, (req, res) => {
    console.log(req.user.premiumTimer)
    res.render('profile', { user: req.user,
     premiumTime:req.user.premiumTimer,
     currentTimestamp: Date.now()
    });
});

module.exports = router;
