const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
let movieData = require("../movie-data-short.json");

//for GET /home
router.get("/", loadMovies);
router.get("/", respondMovies);

router.get('/', (req, res) => {
  res.render('movieList')
})

function loadMovies(req, res, next){
  let results = []; //Stores all of the movies, key=imdbID
  let z = 0;
  movieData.forEach(movie => {
    results[z] = movie;
    z++;
    console.log(movie);
  });
  res.movies = results
  next();
}

function respondMovies(req, res, next){
  res.format({
  "text/html": () => {res.render("movieList", {movies:res.movies} )},
  "application/json": () => {res.status(200).json(res.movies)}
  });
  next();
}

module.exports = router;
