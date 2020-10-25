const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
let movies = require("../movie-data-short.json");

//for GET /home
router.get("/", [loadMovies, respondMovies]);

function loadMovies(req, res, next){
  let result = []; //Stores all of the movies, key=imdbID
  let count = 0;
  let z = 0;
  movieData.forEach(movie => {
    result[z] = movie;
    z++;
    res.movies.push(movie);
    count++;
  });
  next();
}

function respondMovies(req, res, next){
  res.render("views/home", {movies:res.movies});
}

module.exports = router;
