const express = require('express');
const router = express.Router();
let movieData = require("../movie-data-short.json");

//for GET /home
router.get("/", loadMovies);
router.get("/", respondMovies);

router.get("/:id", getMovie);
router.get("/:id", sendMovie);

function getMovie(req, res, next){
  let id = req.params.id;
  let results = []; //Stores all of the movies, key=imdbID
  let z = 0;
  movieData.forEach(movie => {
    movie.id = z;
    results[z] = movie;
    z++;
  });
	if(results[id] === 'undefined'){
    res.status(404).send("Could not find movie");
	}else{
    req.movie = results[id];
		next();
	}
}

function sendMovie(req, res, next){
  res.format({
		"application/json": function(){
			res.status(200).json(req.movie);
		},
		"text/html": () => { res.render("movieView", {movie: req.movie}); }
	});
	next();
}

function loadMovies(req, res, next){
  let results = []; //Stores all of the movies, key=imdbID
  let z = 0;
  movieData.forEach(movie => {
    movie.id = z;
    results[z] = movie;
    z++;
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
