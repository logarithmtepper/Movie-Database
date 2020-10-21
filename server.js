const http = require('http');
const fs = require('fs');
const pug = require('pug');
const express = require('express');

var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//const movieData = require("./movie-data-short.json");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/*const movieRoutes = (app, fs) => {
  const dataPath = './movie-data-short.json';
  app.get('/movies', (req, res) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      res.send(JSON.parse(data));
    });
  });
};

module.exports = movieRoutes;
TRYING TO GET THE SERVER TO SERVE THE MOVIE JSON DATA
*/
app.use('/login', indexRouter);
app.use('/userProfile', usersRouter);

const model = require("./server-model.js");



app.get('/', (req, res) => {
  res.render('home.pug')
})


app.get('/login', (req, res) => {
  res.render('login.pug')
})

app.get('/signUp', (req, res) => {
  res.render('signUp.pug')
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
/*
app.get('/userProfile', (req, res) => {
  res.render('userProfile.pug')
})
*/
app.listen(3000, function () {
  console.log('Server running at port 3000');
});


module.exports = app;
