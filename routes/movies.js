const express = require('express');
const router = express.Router();

const Movie = require("../models/movieModel");
const User = require("../models/userModel");
const Genre = require("../models/genreModel");

start = 10000;
//for GET /home
router.get("/", queryParser);
router.get("/", loadMovies);
router.get("/", loadGenres);
router.get("/", respondMovies);

router.get('/add', function(req, res){
	res.render('addMovie.pug');
});

router.post('/add', function(req, res, next){
	const moviename = req.body.mname;
	const rated = req.body.rated;
	const released = req.body.year;
	const runtime = req.body.runtime;
	var genre = req.body.genre;
	var writername = req.body.wname;
	var directorname = req.body.dname;
	var actorname = req.body.aname;
	const language = req.body.language;

	const genreList = genre.split(";");
	const directorList = writername.split(";");
	const writerList = directorname.split(";");
	const actorList = actorname.split(";");
	const id = start++;

	//need to check if this movie is exist
	let newMovie = new Movie({
		id: id,
		title:moviename,
		rated: rated,
	  	released: released,
	  	runtime: runtime,
	  	genre: genreList,
	 	director: directorList,
	  	writer: writerList,
	  	actors: actorList,
	  	plot: '',
	  	language: language,
	  	ratings:  [],
	  	similar: [],
	})

	newMovie.save(function(err){
		if(err){
		  	console.log(err);
		  	return;
		}else{
			res.redirect('/movies/add');
		}
	});
});


router.get('/edit/:id', ensureAuthenticated, function(req, res){
	Movie.findOne({id:req.params.id}, function(err, movie){
	  	res.render('editMovie', {
			title:'Edit Movie',
			movie:movie
	  	});
	});
});

  // Update Submit POST Route
router.post('/edit/:id', function(req, res){

	var writername = req.body.wname;
	var directorname = req.body.dname;
	var actorname = req.body.aname;

	const directorList = writername.split(";");
	const writerList = directorname.split(";");
	const actorList = actorname.split(";");

	let movie = {};

	movie.writer = writerList;
	movie.actor = actorList;
	movie.director = directorList;

	let query = {id:req.params.id}

	Article.updateOne(query, movie, function(err){
	  if(err){
		console.log(err);
		return;
	  } else {
		req.flash('success', 'Article Updated');
		res.redirect('/movies');
	  }
	});
  });

router.post('/search', function(req, res, next){
	const searchGenre = req.body.searchGenre;
	const searchText = req.body.searchText;
	res.redirect('/movies?name=' + searchText + "&genre=" + searchGenre);
});

router.get("/:id", loadGenres);
router.get("/:id", getMovie);
router.get("/:id", sendMovie);

function queryParser(req, res, next){
	const MAX_MOVIES = 18;

	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");

	try{
		req.query.limit = req.query.limit || 18;
		req.query.limit = Number(req.query.limit);
		if(req.query.limit > MAX_MOVIES){
			req.query.limit = MAX_MOVIES;
		}
	}catch{
		req.query.limit = 18;
	}

	try{
		req.query.page = req.query.page || 1;
		req.query.page = Number(req.query.page);
		if(req.query.page < 1){
			req.query.page = 1;
		}
	}catch{
		req.query.page = 1;
	}

	if(!req.query.name){
		req.query.name = "?";
	}

	if(!req.query.genre){
		req.query.genre = "?";
	}
	next();
}

function getMovie(req, res, next){
  let id = req.params.id;
  Movie.findOne({id:id}, function (err, result) {
		if(err){
			res.status(500).send("Error reading movies.");
			console.log(err);
			return;
		}
		req.movie = result;
		next();
		return;
	});
}

function sendMovie(req, res, next){
  res.format({
		"application/json": function(){
			res.status(200).json(req.movie);
		},
		"text/html": () => { res.render("movieView", {genres:res.genres, movie:req.movie}); }
	});
	next();
}

function loadMovies(req, res, next){
  let startIndex = ((req.query.page-1) * req.query.limit);
  let amount = req.query.limit;

  Movie.find()
	.where("title").regex(new RegExp(".*" + req.query.name + ".*", "i"))
	.where("genre").regex(new RegExp(".*" + req.query.genre + ".*", "i"))
  .limit(amount)
  .skip(startIndex)
  .exec(function(err, results){
		if(err){
			res.status(500).send("Error reading movies.");
			console.log(err);
			return;
		}
		console.log("Found " + results.length + " movies");
		res.movies = results;
		next();
		return;
	})
}

function loadGenres(req, res, next){
	Genre.find()
	.exec(function(err, results){
		if(err){
			res.status(500).send("Error reading movies.");
			console.log(err);
			return;
		}
		console.log("Found " + results.length + " genres");
		res.genres = results;
		next();
		return;
	})
}

function respondMovies(req, res, next){
  res.format({
  "text/html": () => {res.render("movieList", {movies:res.movies, genres:res.genres, qstring: req.qstring, current: req.query.page} )},
  "application/json": () => {res.status(200).json(res.movies)}
  });
  next();
}


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
	  return next();
	} else {
	  req.flash('danger', 'Please login');
	  res.redirect('/users/login');
	}
  }


module.exports = router;
