const express = require('express');
const router = express.Router();
const Movie = require("../movieModel");

//for GET /home
router.get("/", queryParser);
router.get("/", loadMovies);
router.get("/", respondMovies);

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

	next();
}

function getMovie(req, res, next){
  let id = req.params.id;
  Movie.findOne({ id:id}, function (err, result) {
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
		"text/html": () => { res.render("movieView", {movie: req.movie}); }
	});
	next();
}

function loadMovies(req, res, next){
  let startIndex = ((req.query.page-1) * req.query.limit);
  let amount = req.query.limit;

  Movie.find()
  .where("title").regex(new RegExp(".*" + req.query.name + ".*", "i"))
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

function respondMovies(req, res, next){
  res.format({
  "text/html": () => {res.render("movieList", {movies:res.movies, qstring: req.qstring, current: req.query.page } )},
  "application/json": () => {res.status(200).json(res.movies)}
  });
  next();
}

module.exports = router;
