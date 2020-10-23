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


const model = require("./server-model.js");



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


var users = require('./routes/users');
app.use('/users', users);


app.listen(3000, function () {
  console.log('Server running at port 3000');
});
