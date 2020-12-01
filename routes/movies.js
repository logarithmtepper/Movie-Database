const express = require('express');
const fetch = require("node-fetch");
const router = express.Router();
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
	if (req.user === undefined){
		res.redirect("/users/login");
	}
	else if (req.user.contributing !== "y"){
		res.redirect("/users/profile");
	}
	else{
		res.render('addMovie.pug',{
			user:req.user
		});
	}
});

router.get('/addbyurl', function(req, res){
	if (req.user === undefined){
		res.redirect("/users/login");
	}
	else if (req.user.contributing !== "y"){
		res.redirect("/users/profile");
	}
	else{
		res.render('addMovieByUrl.pug',{
			user:req.user
		});
	}
});

function addPersonToMovie(list,role,people, movie){
	const movie_obj = {id:movie.id, name:movie.title}
	Movie.findOne({title:movie.title},function (err, result) {
		if(err){
			console.log(err);
			return;
		}
		if(result === null){
			return;
		}
	});
	for (const name of list){
		Person.findOne({name:name},function (err, person) {
			if(err){
				console.log(err);
				return;
			}
			else{
				person_obj = {id:person.id,name:name};
				person.works.push(movie_obj);
				if(role === "actor"){
					movie.actors.push(person_obj);
				}
				if(role === "writer"){
					movie.writer.push(person_obj);
				}
				if(role === "director"){
					movie.director.push(person_obj);
				}
				for (obj of people){
					if (!person.collaborators.includes(obj) && obj.name!==person_obj.name){
						person.collaborators.push(obj);
					}
				}
				Person.updateOne({name:name},person, function(err){
					if(err){
						console.log(err);
					}
				});
				Movie.updateOne({id:movie.id},movie, function(err){
					if(err){
						console.log(err);
						return;
					}
				});
			}
		})

	}
}

router.post('/addbyurl', function(req, res, next){
	const newMovie = fetchMovieInfo(req.body.murl);

})

router.post('/add', function(req, res, next){
	const title = req.body.mname;
	const rated = req.body.rated;
	const released = req.body.year;
	const runtime = req.body.runtime;
	const language = req.body.language;
	const plot =  req.body.plot;
	const genreList = req.body.genre.trim().split(/\s*,\s*/);
	const directorList = req.body.dname.trim().split(/\s*,\s*/);
	const writerList = req.body.wname.trim().split(/\s*,\s*/);
	const actorList = req.body.aname.trim().split(/\s*,\s*/);

	const id = start++;

	var people = directorList.concat(writerList, actorList)
	var unique_people = people.filter((v, i, a) => a.indexOf(v) === i)

	Movie.findOne({title:title}, function (err, movie) {

	  if(err){
		res.status(500).send("Error reading movie.");
		console.log(err);
		return;
	  }
	  else if (movie!==null){
		res.render("addMovie",{
			error:"This movie exists in the database"
		});
	  }
	  else{
		Person.find({},{"_id":0, "id": 1,"name":1},function(err, result){
		    if (err){
				res.status(500).send("Error reading movie.");
				console.log(err);
				return;
			}
			var colab = result.filter(x=>unique_people.includes(x.name))

			if (colab.length!==unique_people.length){
				return res.render("addMovie",{
					error:"People have to be in the database"
				});
			}

			let newMovie = new Movie({
				id: id,
				title:title,
				rated: rated,
				released: released,
				runtime: runtime,
				genre: genreList,
				director: [],
				writer: [],
				actors: [],
				plot: plot,
				language: language,
				ratings:  [],
				similar: [],
			})
			newMovie.save(function(err){
				if(err){
				  console.log(err);
				  return;
				}
			})
			addPersonToMovie(directorList,"director", colab, newMovie)
			addPersonToMovie(writerList,"writer", colab, newMovie)
			addPersonToMovie(actorList,"actor", colab, newMovie)
			res.redirect("/movies");
		});
	  }
	})
})


router.get('/edit/:id', ensureAuthenticated, function(req, res){
	if (req.user === undefined){
		res.redirect("/users/login");
	}
	else if (req.user.contributing !== "y"){
		res.redirect("/users/profile");
	}
	else{
	  	Movie.findOne({id:req.params.id}, function(err, movie){
	  		res.render('editMovie', {
				title:'Edit Movie',
				movie:movie,
				user:req.user
	  		});
		});
	}
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
		  if (req.body.director === null||req.body.actor === null||req.body.writer === null){
			res.send("Select this person's role in this work");
		  }
		  Movie.findOne(query, function(err, movie){
			  if(err){
				  res.status(500).send("Error reading people.");
				  console.log(err);
				  return;
			  }
			  movie_obj = {id:movie.id,name:movie.title};
			  person_obj = {id:person.id, name:person.name}
			  if (person.works.includes(movie_obj)){
				  res.redirect('/movies/'+movie.id);
				  return;
			  }

			  let collaborators = movie.actors;
			  for (obj of collaborators){
				if (!person.collaborators.includes(obj)){
					person.collaborators.push(obj);
				}
			  }
			  person.works.push(movie_obj)
			  if (req.body.actor != null){
				  movie.actors.push(person_obj)
			  }
			  if (req.body.writer != null){
				  movie.writer.push(person_obj)
			  }
			  if (req.body.director != null){
				  movie.director.push(person_obj)
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

function fetchMovieInfo(url){
  fetch(url)
    .then(res => res.text())
    .then(rawHtml => {

      movie = {}

      // Disgusting regex to find movie title
      try{
        let rawMovieTitle = rawHtml.match('(<div\\sclass="title_wrapper">\\n.+&nbsp;)')[0]
        rawMovieTitle = rawMovieTitle.substring(27, rawMovieTitle.length);
        let movieTitleStart = rawMovieTitle.match('(>)')['index'];
        let movieTitle = rawMovieTitle.substring(movieTitleStart+1, rawMovieTitle.length-6);
        movie.movieTitle = movieTitle;

        // Unset & delete
        rawMovieTitle, movieTitleStart, movieTitle = undefined;
        delete(rawMovieTitle, movieTitleStart, movieTitle);

      }catch {
        movie.movieTitle = "N/A";
      };

      // Disgusting regex to find movie release year
      try{
        let rawMovieYear = rawHtml.match('(<span\\sid="titleYear">)')['index'];
        let movieYear = rawHtml.substring(rawMovieYear+60, rawMovieYear+64);
        movie.movieYear = movieYear;

        // Unset & delete
        rawMovieYear, movieYear = undefined;
        delete(rawMovieYear, movieYear);

      }catch {
        movie.movieYear = "N/A";
      };

      // Disgusting regex to find age rated
      try{
        let rawMovieRating = rawHtml.match('(<time\\sdatetime="PT)')['index'];
        let movieRating = rawHtml.substring(rawMovieRating-150, rawMovieRating-53);
        let movieRatingStart = movieRating.match('(\\s{20}.{1,10})')['index'];
        movieRating = movieRating.substring(movieRatingStart+21, movieRating.length);
        movie.movieRating = movieRating;

        // Unset & delete
        rawMovieRating, movieRating, movieRatingStart = undefined;
        delete(rawMovieRating, movieRating, movieRatingStart);

      }catch {
        movie.movieRating = "N/A";
      }

      // Disgusting regex to find runtime
      try{
        let rawMovieRuntime = rawHtml.match('([0-9]min)')['index'];
        let movieRuntimeStart = rawHtml.substring(rawMovieRuntime-50, rawMovieRuntime+20).match('(\\s{24})')['index'];
        let movieRuntime = rawHtml.substring(rawMovieRuntime-25+movieRuntimeStart, rawMovieRuntime+4);
        movie.movieRuntime = movieRuntime;

        // Unset & delete
        rawMovieRuntime, movieRuntimeStart, movieRuntime = undefined;
        delete(rawMovieRuntime, movieRuntimeStart, movieRuntime);

      }catch {
        movie.movieRuntime = "N/A";
      }

      // Disgusting regex to find genre
      try{
        let movieGenres = [];
        let rawMovieGenres = rawHtml.matchAll('(\\/search\\/title\\?genres[^&]+&)');
        for(const genre of rawMovieGenres){
          movieGenreEnd = rawHtml.substring(genre['index'], genre['index']+40).match('(&)');
          movieGenres.push(rawHtml.substring(genre['index']+21, genre['index']+movieGenreEnd['index']));
        };
        movieGenres = movieGenres.splice(0, Math.floor(movieGenres.length / 2));
        movie.movieGenre = movieGenres;

        // Unset & delete
        movieGenres, rawMovieGenres, movieGenreEnd = undefined;
        delete(movieGenres, rawMovieGenres, movieGenreEnd);

      }catch {
        movie.movieGenre = "N/A";
      }

      // Disgusting regex to find director
      try{
        let rawMovieDirector = rawHtml.match('"inline">Director')['index'];
        let movieDirectorEnd = rawHtml.substring(rawMovieDirector, rawMovieDirector+150).match('<\\/a>')['index'];
        movie.movieDirector = rawHtml.substring(rawMovieDirector+66, rawMovieDirector+movieDirectorEnd);

        // Unset & delete
        rawMovieDirector, movieDirectorEnd = undefined;
        delete(rawMovieDirector, movieDirectorEnd);

      }catch {
        movie.movieDirector = "N/A";
      }

      // Disgusting regex to find writers
      try{
        let movieWriters = [];
        let movieWritersStart = rawHtml.match('(Writers)')['index'];
        let movieWritersEnd = rawHtml.substring(movieWritersStart, movieWritersStart+200).match('(ghost)')['index'];
        let people = rawHtml.substring(movieWritersStart, movieWritersStart+movieWritersEnd);
        people = people.matchAll('(tt_ov_wr"\\n>[^<]+)');
        for(const person of people){
          movieWriters.push(person[0].substring(11, person[0].length));
        };
        movie.movieWriters = movieWriters;

        // Unset & delete
        movieWriters, movieWritersStart, movieWritersEnd, people = undefined;
        delete(movieWriters, movieWritersStart, movieWritersEnd, people);
      }catch {
        movie.movieWriters = "N/A";
      }

      // Disgusting regex to find actors
      try{
        let movieActors = [];
        let movieActorsStart = rawHtml.match('(Stars)')['index'];
        let movieActorsEnd = rawHtml.substring(movieActorsStart, movieActorsStart+400).match('(ghost)')['index'];
        let people = rawHtml.substring(movieActorsStart, movieActorsStart+movieActorsEnd);
        people = people.matchAll('(tt_ov_st_sm"\\n>[^<]+)');
        for(const person of people){
          movieActors.push(person[0].substring(14, person[0].length));
        };
        movie.movieActors = movieActors;

        // Unset & delete
        movieActors, movieActorsStart, movieActorsEnd, people = undefined;
        delete(movieActors, movieActorsStart, movieActorsEnd, people);

      }catch {
        movie.movieActors = "N/A";
      }

      // Disgusting regex to find plot
      try {
        let moviePlotStart = rawHtml.match('(summary_text)')['index'];
        let moviePlotEnd = rawHtml.substring(moviePlotStart, moviePlotStart+500).match('(<\/div>)')['index'];
        let moviePlot = rawHtml.substring(moviePlotStart+35, moviePlotStart+moviePlotEnd-13);
        let cleanedPlot = "";
        let addLetters = true;

        // Clean out the html tags
        moviePlot.split('').forEach(c => {
          if(c == '<'){
            addLetters = false;
          };
          if(addLetters) {
            cleanedPlot += c;
          };
          if(c == '>'){
            addLetters = true;
          };

        });
        movie.moviePlot = cleanedPlot;

        // Unset & delete
        moviePlotStart, moviePlotEnd, moviePlot, cleanedPlot, addLetters = undefined;
        delete(moviePlotStart, moviePlotEnd, moviePlot, cleanedPlot, addLetters);

      }catch {
        movie.moviePlot = "N/A";
      }

      // Disgusting regex to find poster
      try{
        let moviePosterStart = rawHtml.match('(class=\"poster\")')['index'];
        let moviePosterEnd = rawHtml.substring(moviePosterStart, moviePosterStart+400).match('(\\.jpg)')['index'];
        let moviePosterStart2 = rawHtml.substring(moviePosterStart, moviePosterStart+moviePosterEnd+4).match('(src=\")')['index'];
        let moviePoster = rawHtml.substring(moviePosterStart+moviePosterStart2+5, moviePosterStart+moviePosterEnd+4);
        movie.moviePoster = moviePoster;

        // Unset & delete
        moviePosterStart, moviePosterEnd, moviePosterStart2, moviePoster = undefined;
        delete(moviePosterStart, moviePosterEnd, moviePosterStart2, moviePoster);

      }catch {
        movie.moviePoster = "N/A";
      }

      // Disgusting regex to find ratings
      try{
        let movieMetascoreStart = rawHtml.match('(\"metacriticScore score_favorable titleReviewBarSubItem)')['index'];
        let movieMetascoreEnd = rawHtml.substring(movieMetascoreStart, movieMetascoreStart+400).match('(</span>)')['index'];
        let movieMetascore = rawHtml.substring(movieMetascoreStart+63, movieMetascoreStart + movieMetascoreEnd);
        movie.movieMetascore = movieMetascore

        // Unset & delete
        movieMetascoreStart, movieMetascoreEnd, movieMetascore = undefined;
        delete(movieMetascoreStart, movieMetascoreEnd, movieMetascore);

      }catch{
        movie.movieMetascore = "N/A";
      }

      // Disgusting regex to find movie rating
      try {
        let rawImdbRating = rawHtml.match('(itemprop="ratingValue")')['index'];
        let movieImdbRating = rawHtml.substring(rawImdbRating+23, rawImdbRating+26);
        movie.movieImdbRating = movieImdbRating
      }catch {
        movie.movieImdbRating = "N/A"
      }

      try {
        let rawMovieLanguage = rawHtml.match('(Language:<\/h4)')['index'];
        let movieLanguageEnd = rawHtml.substring(rawMovieLanguage, rawMovieLanguage+1500).match('(<\/div>)')['index'];
        let movieLanguage = rawHtml.substring(rawMovieLanguage, rawMovieLanguage+movieLanguageEnd);

        let cleanedLanguage = "";
        let add_letters = true;

        // Clean out the html tags
        movieLanguage.split('').forEach(c => {
          if(c == '<'){
            add_letters = false;
          };
          if(add_letters) {
            cleanedLanguage += c;
          };
          if(c == '>'){
            add_letters = true;
          };

        });

        // Clean out excess
        let cleanedLanguage2 = [];
        cleanedLanguage = cleanedLanguage.split('\n');
        for(i = 0; i<cleanedLanguage.length; i++) {
          if(i % 2 == 1){
            cleanedLanguage2.push(cleanedLanguage[i].trim())
          }
        }

        movie.movieLanguage = cleanedLanguage2;

        // Unset & delete
        rawMovieLanguage, movieLanguageEnd, movieLanguage, cleanedLanguage, add_letters, cleanedLanguage2 = undefined;
        delete(rawMovieLanguage, movieLanguageEnd, movieLanguage, cleanedLanguage, add_letters, cleanedLanguage2);

      }catch(err) {
        movie.movieLanguage = "N/A";
      }

      console.log(movie);
    });
}

module.exports = router;
