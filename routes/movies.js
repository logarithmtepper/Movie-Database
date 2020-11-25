const express = require('express');
const router = express.Router();
const addPerson = require("./people").addPerson;
const Movie = require("../models/movieModel");
const Person = require("../models/personModel");
const Genre = require("../models/genreModel");

start = 10000;
//for GET /home
router.get("/", queryParser);
router.get("/", loadMovies);
router.get("/", loadGenres);
router.get("/", respondMovies);

router.get('/add', function(req, res){
	res.render('addMovie.pug',{
		user:req.user
	});
});

router.post('/add', function(req, res, next){
	const moviename = req.body.mname;
	const rated = req.body.rated;
	const released = req.body.year;
	const runtime = req.body.runtime;
	const language = req.body.language;

	const genreList = req.body.genre.split(",");
	var directorList = req.body.dname.split(",");
	var writerList = req.body.wname.split(",");
	var actorList = req.body.aname.split(",");
	const id = start++;

	const director = findPersonID(directorList);
	const writer = findPersonID(writerList);
	const actor = findPersonID(actorList);

	//need to check if this movie is exist
	let newMovie = new Movie({
		id: id,
		title:moviename,
		rated: rated,
	  	released: released,
	  	runtime: runtime,
	  	genre: genreList,
	 	director: director,
	  	writer: writer,
	  	actors: actor,
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
			movie:movie,
			user:req.user
	  	});
	});
});

  // Update Submit POST Route
router.post('/edit/:id', function(req, res){
	const name = req.body.name;
	const query = {id:req.params.id}
	//need to check if this person is exist
	Person.findOne({name:name}, function (err, person) {
	  if(err){
		res.status(500).send("Error reading people.");
		console.log(err);
		return;
	  }
	  if (person===null){
		res.redirect('/people/add');
	  }else{
		  if (req.body.director === null||req.body.director === null||req.body.director === null){
			res.send("Select this person's role in this work");
		  }
		  Movie.findOne(query, function(err, movie){
			  if(err){
				  res.status(500).send("Error reading people.");
				  console.log(err);
				  return;
			  }
			  if (person.works.includes(movie.id)){
				  res.redirect('/movies/'+movie.id);
				  return;
			  }
			  let collaborators = movie.actors;
			  for (i of collaborators){
				if (!person.collaborators.includes(i)){
					person.collaborators.push(i);
				}
			  }
			  person.works.push(movie.id)
			  if (req.body.actor != null){
				  movie.actors.push(person.id)
			  }
			  if (req.body.writer != null){
				  movie.writer.push(person.id)
			  }
			  if (req.body.director != null){
				  movie.director.push(person.id)
			  }
			  Movie.updateOne(query, movie, function(err){
				if(err){
				  console.log(err);
				  return;
				}
			  });
			  Person.updateOne({name:name}, person, function(err){
				if(err){
				  console.log(err);
				  return;
				}
			  });
			  res.redirect('/movies/'+req.params.id)
		  })
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

function findPersonID(list){
  for (i in list){
	Person.findOne({name:list[i]}, function (err, person) {
	  if(err){
		res.status(500).send("Error reading people.");
		console.log(err);
		return;
	  }
	  if (person===null){
		list[i] = addPerson(list[i],'',[]);
		return list[i];
	  }else{
		list[i] = person.id;
		return list[i];
	  }
	});
  }
  return list;
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
		"text/html": () => { res.render("movieView", {genres:res.genres, movie:req.movie,user:req.user}); }
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
  "text/html": () => {res.render("movieList", {movies:res.movies, genres:res.genres, qstring: req.qstring, current: req.query.page,user:req.user} )},
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
