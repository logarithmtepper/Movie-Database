const http = require('http');
const pug = require('pug');
const express = require('express');
//const express = require("connect-flash");
var path = require('path');
var bodyParser = require('body-parser');
const mongoose = require("mongoose");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//Router Setup
let userRouter = require('./routes/users');
app.use('/users', userRouter);

let movieRouter = require('./routes/movies');
app.use('/movies', movieRouter);

//const peopleRouter = require('./routes/people');
//app.use('/people', peopleRouter);

//Respond with right page data if requested

app.get('/', (req, res, next) => {
  res.render('home.pug')
})

app.get('/forgotPassword', (req, res, next) => {
  res.render('forgotPassword.pug')
})

app.get('/addMovie', (req, res, next) => {
  res.render('addMovie.pug')
})

app.get('/addPerson', (req, res, next) => {
  res.render('addPerson.pug')
})

app.get('/movieView', (req, res, next) => {
  res.render('movieView.pug')
})

app.get('/personView', (req, res, next) => {
  res.render('personView.pug')
})

app.get('/userView', (req, res, next) => {
  res.render('userView.pug')
})

app.get('/userProfile', (req, res, next) => {
  res.render('userProfile.pug')
})

mongoose.connect('mongodb://localhost/database', {useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  app.listen(3000);
  console.log("Server listening on port 3000");
});
