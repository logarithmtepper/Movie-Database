const http = require('http');
const pug = require('pug');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
var path = require('path');
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
const passport = require('passport');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(flash());
app.use((req,res,next)=> {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error  = req.flash('error');
next();
});


app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Passport Config
require('./config/passport.js')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());



//Router Setup
let reviewRouter = require('./routes/reviews');
app.use('/reviews', reviewRouter);

let userRouter = require('./routes/users');
app.use('/users', userRouter);

let movieRouter = require('./routes/movies');
app.use('/movies', movieRouter);

const peopleRouter = require('./routes/people');
app.use('/people', peopleRouter.router);




//Respond with right page data if requested
app.get('/', (req, res, next) => {
  res.render('home.pug',{
    user:req.user
  });
});

app.get('/forgotPassword', (req, res, next) => {
  res.render('forgotPassword.pug')
})

mongoose.connect('mongodb://localhost/database', {useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  console.log("database is connected");
});
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});
