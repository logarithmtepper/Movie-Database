const express = require('express');
const router = express.Router();
const Person = require("../models/personModel");
let User = require("../models/userModel");
const Movie = require("../models/movieModel");
start = 100000;

router.get("/", queryParser);
router.get("/", loadPeople);
router.get("/", respondPeople);

//add person
router.get('/add', ensureAuthenticated, function(req, res){
	res.render('addPerson.pug',{
		user:req.user
	});
});

function addPerson(name,works,collaborators){
	const id = start++;
	let newPerson = new Person({
		id: id,
		works: [works],
		collaborators:collaborators,
		name:name
	})
	newPerson.save(function(err){
		if(err){
			console.log(err);
			return;
		}
	});
	return newPerson.id;
}
router.post('/add', ensureAuthenticated, function(req, res, next){
  const name = req.body.name;
  const work = req.body.work;


  //need to check if this person is exist
  Person.findOne({name:name}, function (err, result) {
	if(err){
	  res.status(500).send("Error reading people.");
	  console.log(err);
	  return;
	}
	if (result!==null){
	  res.send('This person is exist in the database');
	}else{
	  if (work !== ''){
		if (req.body.director === null||req.body.director === null||req.body.director === null){
		  res.send("Select this person's role in this work");
		}
		Movie.findOne({title:work}, function(err, movie){
			if(err){
				res.status(500).send("Error reading people.");
				console.log(err);
				return;
			}
			let collaborators = movie.actors;
			const personID = addPerson(name,movie.id,collaborators)
			if (req.body.actor != null){movie.actors.push(personID);}
			if (req.body.writer != null){movie.writer.push(personID);}
			if (req.body.director != null){movie.director.push(personID);}
			Movie.updateOne({title:work}, movie, function(err){
			  if(err){
				console.log(err);
				return;
			  }
			});
			res.redirect('/people/add');

		})
	  }else{//when work entry is empty
		addPerson(name,'',[]);
		res.redirect('/people/add');
	  }
	}
  });

});

router.get('/follow/:id', ensureAuthenticated, function (req, res, next) {
	const id = req.params.id;
	const user_id = req.user._id;
	User.findById(user_id, function(err, user){
	  if (user.followedPeople.includes(id)){
		res.send("You have followed this user");
	  }else{
		user.followedPeople.push(id)
		User.updateOne({_id:user_id}, user, function(err){
		  if(err){
			console.log(err);
			return;
		  } else {
			//res.flash("You have followed this user");
			res.redirect('/people/'+id);
		  }
		});
	  }
	});
});

router.get('/unfollow/:id', ensureAuthenticated, function (req, res, next) {
	const id = req.params.id;
	const user_id = req.user._id;
	User.findById(user_id, function(err, user){
	  if (user.followedPeople.includes(id)){
		const index = user.followedPeople.indexOf(id);
		user.followedPeople.splice(index,1);
		User.updateOne({_id:user_id}, user, function(err){
		  if(err){
			console.log(err);
			return;
		  } else {
			//res.flash("You have unfollowed this user");
			res.redirect('/people/'+id);
		  }
		});
	  }else{
		res.send("You have not followed this user yet");
	  }
	});
});

router.get("/:id", getPerson);
router.get("/:id", sendPerson);

function queryParser(req, res, next){
	const MAX_PEOPLE = 66;

	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");

	try{
		req.query.limit = req.query.limit || 66;
		req.query.limit = Number(req.query.limit);
		if(req.query.limit > MAX_PEOPLE){
			req.query.limit = MAX_PEOPLE;
		}
	}catch{
		req.query.limit = 66;
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

function getPerson(req, res, next){
  let id = req.params.id;
  Person.findOne({ id:id}, function (err, result) {
		if(err){
			res.status(500).send("Error reading people.");
			console.log(err);
			return;
		}
		req.person = result;
		next();
		return;
	});
}

function sendPerson(req, res, next){
  res.format({
		"application/json": function(){
			res.status(200).json(req.person);
		},
		"text/html": () => { res.render("personView", {person: req.person}); }
	});
	next();
}

function loadPeople(req, res, next){
	let startIndex = ((req.query.page-1) * req.query.limit);
  let amount = req.query.limit;

  Person.find()
  .where("name").regex(new RegExp(".*" + req.query.name + ".*", "i"))
  .limit(amount)
  .skip(startIndex)
  .exec(function(err, results){
		if(err){
			res.status(500).send("Error reading people.");
			console.log(err);
			return;
		}
		console.log("Found " + results.length + " people");
		res.people = results;
		next();
		return;
	})
}

function respondPeople(req, res, next){
	res.format({
  "text/html": () => {res.render("personList", {people:res.people, qstring: req.qstring, current: req.query.page } )},
  "application/json": () => {res.status(200).json(res.people)}
  });
  next();
}


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/users/login');
}

module.exports = {
	router:router,
	addPerson:addPerson
};
