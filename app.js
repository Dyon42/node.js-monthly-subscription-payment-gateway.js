var fs = require('fs')
const https = require('https')
const express = require('express');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const cookiehandler = require("./config/cookiehandler.js");
const  bodyParser =require('body-parser')
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const path = require('path');
const { User, createUser, comparePassword, getUserByEmail, getUserById } = require('./models/user-model');
const keyPublishable = 'pk_test_buuDpeGrg86pyZQwOkQIShGe';
const keySecret = 'sk_test_VVFhFIC9RnlyEFSq7bD2TmmD';
const stripe = require("stripe")(keySecret);




const app = express();
//app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');
app.set('view engine', 'ejs');

cookiehandler(app)


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator());


app.use(flash());
app.use(function(req, res, next){
	res.locals.success_message = req.flash('success_message');
	res.locals.error_message = req.flash('error_message');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
  	next();
});

// connect to mongodb
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongodb.dbURI,{
    useMongoClient: true
  });

// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// create home route
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});


app.get("/payment", ((req, res) => {
    let data_amount = 700
    res.render("payment",{keyPublishable: keyPublishable, data_amount}); // render the view file : views/index.pug
}));



function premiumMonth(){
return Date.now()+2592000
}



// POST http://localhost:3000/charge
app.post("/charge", function(req, res) {

    let amount = 566*1000; // 500 cents means $5 

    // create a customer 
    stripe.customers.create({
        email: req.body.stripeEmail, // customer email, which user need to enter while making payment
        source: req.body.stripeToken // token for the given card 
    })
    .then(customer =>
        stripe.charges.create({ // charge the customer
        amount,
        description: "dyon",
            currency: "usd",
            customer: customer.id
        }))
    .then(charge => {

        
        User.findOneAndUpdate({
  googleId: req.user.googleId
}, {
  $set: {
    premiumTimer: premiumMonth()
  }
}).then(user => {
   
  console.log("user", user);
});
res.render("premium")
        console.log("this issssss",req.user._id)
        }); // render the charge view: views/charge.pug

});


app.get("/premium", ((req, res) => {
    res.render("premium"); // render the view file : views/index.pug
}));

const port = process.env.PORT || 3030;
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  }, app).listen(port);
