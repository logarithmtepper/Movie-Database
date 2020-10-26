const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
let movies = require("../movie-data-short.json");

//for GET /home
router.get("/", loadMovies);
router.get("/", respondMovies);

function loadMovies(req, res, next){
  let result = []; //Stores all of the movies, key=imdbID
  let count = 0;
  let z = 0;
  movieData.forEach(movie => {
    result[z] = movie;
    z++;
    res.movies.push(movie);
    count++;
    console.log(movie);
  });
  next();
}

function respondMovies(req, res, next){
  res.format({
  "text/html": () => {res.render("views/pages/home", {movies:res.movies} )},
  "application/json": () => {res.status(200).json(res.movies)}
  });
  next();
}

module.exports = router;
