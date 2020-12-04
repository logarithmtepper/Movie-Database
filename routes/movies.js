const express = require('express');
const fetch = require("node-fetch");
const router = express.Router();
const Movie = require("../models/movieModel");
const Person = require("../models/personModel");
const Genre = require("../models/genreModel");
const User = require("../models/userModel");
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
					if (!person.collaborators.some(a => a.name === obj.name) && obj.name!==person_obj.name){
						person.collaborators.push(obj);
					}
				}
				sendNotification(person.follower, person.name)
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
};

router.post('/addbyurl', function(req, res, next){
	fetch(req.body.murl)
    .then(res => res.text())
    .then(rawHtml => {

			let directorList = [];
			let writerList = [];
			let actorList = [];
			let id = start++

			let newMovie = new Movie({
				id:id,
				title:"",
				rated:"",
				released:"",
				runtime:"",
				genre:[],
				director: [],
				writer: [],
				actors: [],
				plot:"",
				language:"",
				ratings:  [],
				similar: [],
				poster:""
			})

      try{
        let rawMovieTitle = rawHtml.match('(<div\\sclass="title_wrapper">\\n.+&nbsp;)')[0]
        rawMovieTitle = rawMovieTitle.substring(27, rawMovieTitle.length);
        let movieTitleStart = rawMovieTitle.match('(>)')['index'];
        let movieTitle = rawMovieTitle.substring(movieTitleStart+1, rawMovieTitle.length-6);
        newMovie.title = movieTitle;

        rawMovieTitle, movieTitleStart, movieTitle = undefined;
        delete(rawMovieTitle, movieTitleStart, movieTitle);

      }catch {
        newMovie.title = "N/A";
      };

      try{
        let rawMovieYear = rawHtml.match('(<span\\sid="titleYear">)')['index'];
        let movieYear = rawHtml.substring(rawMovieYear+60, rawMovieYear+64);
        newMovie.released = movieYear;

        rawMovieYear, movieYear = undefined;
        delete(rawMovieYear, movieYear);

      }catch {
        newMovie.released = "N/A";
      };

      try{
        let rawMovieRating = rawHtml.match('(<time\\sdatetime="PT)')['index'];
        let movieRating = rawHtml.substring(rawMovieRating-150, rawMovieRating-53);
        let movieRatingStart = movieRating.match('(\\s{20}.{1,10})')['index'];
        movieRating = movieRating.substring(movieRatingStart+21, movieRating.length);
        newMovie.rated = movieRating;

        rawMovieRating, movieRating, movieRatingStart = undefined;
        delete(rawMovieRating, movieRating, movieRatingStart);

      }catch {
        newMovie.rated = "N/A";
      }

      try{
        let rawMovieRuntime = rawHtml.match('([0-9]min)')['index'];
        let movieRuntimeStart = rawHtml.substring(rawMovieRuntime-50, rawMovieRuntime+20).match('(\\s{24})')['index'];
        let movieRuntime = rawHtml.substring(rawMovieRuntime-25+movieRuntimeStart, rawMovieRuntime+4);
        newMovie.runtime = movieRuntime;

        rawMovieRuntime, movieRuntimeStart, movieRuntime = undefined;
        delete(rawMovieRuntime, movieRuntimeStart, movieRuntime);

      }catch {
        newMovie.runtime = "N/A";
      }

      try{
        let movieGenres = [];
        let rawMovieGenres = rawHtml.matchAll('(\\/search\\/title\\?genres[^&]+&)');
        for(const genre of rawMovieGenres){
          movieGenreEnd = rawHtml.substring(genre['index'], genre['index']+40).match('(&)');
          movieGenres.push(rawHtml.substring(genre['index']+21, genre['index']+movieGenreEnd['index']));
        };
        movieGenres = movieGenres.splice(0, Math.floor(movieGenres.length / 2));
        newMovie.genre = movieGenres;

        movieGenres, rawMovieGenres, movieGenreEnd = undefined;
        delete(movieGenres, rawMovieGenres, movieGenreEnd);

      }catch {
        newMovie.genre = "N/A";
      }

      try{
				let movieDirector = "";
        let rawMovieDirector = rawHtml.match('"inline">Director')['index'];
        let movieDirectorEnd = rawHtml.substring(rawMovieDirector, rawMovieDirector+150).match('<\\/a>')['index'];
        movieDirector = rawHtml.substring(rawMovieDirector+66, rawMovieDirector+movieDirectorEnd);

				directorList.push(movieDirector);

        rawMovieDirector, movieDirectorEnd = undefined;
        delete(rawMovieDirector, movieDirectorEnd);

      }catch {
        directorList = ["N/A"];
      }

      try{
        let movieWriters = [];
        let movieWritersStart = rawHtml.match('(Writers)')['index'];
        let movieWritersEnd = rawHtml.substring(movieWritersStart, movieWritersStart+200).match('(ghost)')['index'];
        let people = rawHtml.substring(movieWritersStart, movieWritersStart+movieWritersEnd);
        people = people.matchAll('(tt_ov_wr"\\n>[^<]+)');
        for(const person of people){
          movieWriters.push(person[0].substring(11, person[0].length));
        };
        writerList = movieWriters;

        movieWritersStart, movieWritersEnd, people = undefined;
        delete(movieWritersStart, movieWritersEnd, people);
      }catch {
        writerList = ["N/A"];
      }

      try{
        let movieActors = [];
        let movieActorsStart = rawHtml.match('(Stars)')['index'];
        let movieActorsEnd = rawHtml.substring(movieActorsStart, movieActorsStart+400).match('(ghost)')['index'];
        let people = rawHtml.substring(movieActorsStart, movieActorsStart+movieActorsEnd);
        people = people.matchAll('(tt_ov_st_sm"\\n>[^<]+)');
        for(const person of people){
          movieActors.push(person[0].substring(14, person[0].length));
        };
      	actorList = movieActors;

				movieActorsStart, movieActorsEnd, people = undefined;
        delete(movieActorsStart, movieActorsEnd, people);

      }catch {
        actorList = ["N/A"];
      }

      try {
        let moviePlotStart = rawHtml.match('(summary_text)')['index'];
        let moviePlotEnd = rawHtml.substring(moviePlotStart, moviePlotStart+500).match('(<\/div>)')['index'];
        let moviePlot = rawHtml.substring(moviePlotStart+35, moviePlotStart+moviePlotEnd-13);
        let cleanedPlot = "";
        let addLetters = true;

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
        newMovie.plot = cleanedPlot;

        moviePlotStart, moviePlotEnd, moviePlot, cleanedPlot, addLetters = undefined;
        delete(moviePlotStart, moviePlotEnd, moviePlot, cleanedPlot, addLetters);

      }catch {
        newMovie.plot = "N/A";
      }

      try{
        let moviePosterStart = rawHtml.match('(class=\"poster\")')['index'];
        let moviePosterEnd = rawHtml.substring(moviePosterStart, moviePosterStart+400).match('(\\.jpg)')['index'];
        let moviePosterStart2 = rawHtml.substring(moviePosterStart, moviePosterStart+moviePosterEnd+4).match('(src=\")')['index'];
        let moviePoster = rawHtml.substring(moviePosterStart+moviePosterStart2+5, moviePosterStart+moviePosterEnd+4);
        newMovie.poster = moviePoster;

        moviePosterStart, moviePosterEnd, moviePosterStart2, moviePoster = undefined;
        delete(moviePosterStart, moviePosterEnd, moviePosterStart2, moviePoster);

      }catch {
        newMovie.poster = "N/A";
      }

      try{
        let movieMetascoreStart = rawHtml.match('(\"metacriticScore score_favorable titleReviewBarSubItem)')['index'];
        let movieMetascoreEnd = rawHtml.substring(movieMetascoreStart, movieMetascoreStart+400).match('(</span>)')['index'];
        let movieMetascore = rawHtml.substring(movieMetascoreStart+63, movieMetascoreStart + movieMetascoreEnd);
        newMovie.ratings.push({Source: "Metacritic", Value:movieMetascore})

        movieMetascoreStart, movieMetascoreEnd, movieMetascore = undefined;
        delete(movieMetascoreStart, movieMetascoreEnd, movieMetascore);

      }catch{
        movieMetascore = "N/A";
      }

      try {
        let rawImdbRating = rawHtml.match('(itemprop="ratingValue")')['index'];
        let movieImdbRating = rawHtml.substring(rawImdbRating+23, rawImdbRating+26);
        newMovie.ratings.push({Source: "IMDB", Value:movieImdbRating})
      }catch {
        movieImdbRating = "N/A"
      }

      try {
        let rawMovieLanguage = rawHtml.match('(Language:<\/h4)')['index'];
        let movieLanguageEnd = rawHtml.substring(rawMovieLanguage, rawMovieLanguage+1500).match('(<\/div>)')['index'];
        let movieLanguage = rawHtml.substring(rawMovieLanguage, rawMovieLanguage+movieLanguageEnd);

        let cleanedLanguage = "";
        let addLetters = true;

        movieLanguage.split('').forEach(c => {
          if(c == '<'){
            addLetters = false;
          };
          if(addLetters) {
            cleanedLanguage += c;
          };
          if(c == '>'){
            addLetters = true;
          };

        });

        let cleanedLanguage2 = [];
        cleanedLanguage = cleanedLanguage.split('\n');
        for(i = 0; i<cleanedLanguage.length; i++) {
          if(i % 2 == 1){
            cleanedLanguage2.push(cleanedLanguage[i].trim())
          }
        }

        newMovie.language = cleanedLanguage2[0];

        rawMovieLanguage, movieLanguageEnd, movieLanguage, cleanedLanguage, addLetters, cleanedLanguage2 = undefined;
        delete(rawMovieLanguage, movieLanguageEnd, movieLanguage, cleanedLanguage, addLetters, cleanedLanguage2);

      }catch(err) {
        movieLanguage = "N/A";
      }

			var people = directorList.concat(actorList, writerList)
			var uniquePeople = people.filter((v, i, a) => a.indexOf(v) === i)

			Movie.findOne({title:newMovie.title}, function (err, movie) {
				if(err){
					res.status(500).send("Error reading movie.");
					console.log(err);
					return;
				}
				else if (movie!==null){
					res.render("addMovieByUrl",{
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
					var colab = result.filter(x=>uniquePeople.includes(x.name))

					if (colab.length!==uniquePeople.length){
						let peopleString = "";
						uniquePeople.forEach(person => {peopleString += person + ", "});
						return res.render("addMovieByUrl",{
							error:"People must be in database to add new movie. Try adding these to the database: " + peopleString
						});
					}
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
	const poster = req.body.poster;

	const id = start++;

	var people = directorList.concat(writerList, actorList)
	var uniquePeople = people.filter((v, i, a) => a.indexOf(v) === i)

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
			var colab = result.filter(x=>uniquePeople.includes(x.name))

			if (colab.length!==uniquePeople.length){
				let peopleString = "";
				uniquePeople.forEach(person => {peopleString += person + ", "});
				return res.render("addMovie",{
					error:"People must be in database to add new movie. Try adding these to the database: " + peopleString
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
				poster: poster
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
	if (req.user.contributing !== "y"){
		res.redirect("/users/profile");
	}
	else{
	  Movie.findOne({id:req.params.id}, function(err, movie){
	  	res.render('editMovie', {
			title:movie.title,
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

			  var people = movie.director.concat(movie.writer, movie.actors)
			  var collaborators = people.filter((v, i, a) => a.indexOf(v) === i)
			  for (obj of collaborators){
				if (!person.collaborators.some(a => a.name === obj.name)&& obj.name!==person_obj.name){
					person.collaborators.push(obj);
				}
			  }
			  if (!person.works.some(a => a.id === movie_obj.id)){person.works.push(movie_obj)}
			  if (req.body.actor != null&&!movie.actors.some(a => a.name === person_obj.name)){
				  movie.actors.push(person_obj)
			  }
			  if (req.body.writer != null&&!movie.writer.some(a => a.name === person_obj.name)){
				  movie.writer.push(person_obj)
			  }
			  if (req.body.director != null&&!movie.director.some(a => a.name === person_obj.name)){
				  movie.director.push(person_obj)
			  }
			  sendNotification(person.follower, person.name)
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

//ensureAuthenticated: make sure user is logged in
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
	  return next();
	} else {
	  req.flash('danger', 'Please login');
	  res.redirect('/users/login');
	}
}

//helper for send notification
function sendNotification(follower, person) {
	for (const id of follower){
	  User.findById({_id:id}, function(err,user){
		if(err){
		  console.log(err);
		  return;
		}
		transporter.sendMail({
		  from: 'noreplay_database_test@outlook.com',
		  to: user.email,
		  subject: person+' has a new work',
		  text: 	"Hello "+user.username+
				  	",\n\n"+person+' just had a new work in our database, check it out!'+
					"\n\nMovie Database Team"
		}, function(err){
		  if(err){
			console.log(err);
			return
		  }
		  console.log('Message sent');
		});
	  })
	}
  }


module.exports = router;
