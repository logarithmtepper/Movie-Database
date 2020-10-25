const http = require('http');
const fs = require('fs');
const pug = require('pug');
const express = require('express');
//const express = require("connect-flash");
var path = require('path');
var bodyParser = require('body-parser');
//const movieData = require("./movie-data-short.json");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('home.pug')
})

app.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword.pug')
})

app.get('/addMovie', (req, res) => {
  res.render('addMovie.pug')
})

app.get('/addPerson', (req, res) => {
  res.render('addPerson.pug')
})

app.get('/movieView', (req, res) => {
  res.render('movieView.pug')
})

app.get('/personView', (req, res) => {
  res.render('personView.pug')
})

app.get('/userView', (req, res) => {
  res.render('userView.pug')
})

app.get('/userProfile', (req, res) => {
  res.render('userProfile.pug')
})

const userRouter = require('./routes/users');
app.use('/users', userRouter);

const movieRouter = require('./routes/movies');
app.use('/home', movieRouter);

//const peopleRouter = require('./routes/people');
//app.use('/people', peopleRouter);

app.listen(3000, function () {
  console.log('Server running at port 3000');
});
