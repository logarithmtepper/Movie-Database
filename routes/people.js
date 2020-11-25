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

function addPerson(name){
	const id = start++;
	let newPerson = new Person({
		id: id,
		works: [],
		collaborators:[],
		name:name
	})
	newPerson.save(function(err){
		if(err){
			console.log(err);
			return;
		}
	});
	return id;
}
function addPersonWork(name, work){
	const id = start++;
	let newPerson = new Person({
		id: id,
		works: [work],
		collaborators:[],
		name:name
	})
	newPerson.save(function(err){
		if(err){
			console.log(err);
			return;
		}
	});
	return id;
}

router.post('/search', function(req, res, next){
	const searchText = req.body.searchText;
	res.redirect('/people?name=' + searchText);
});

router.post('/add', ensureAuthenticated, function(req, res, next){
  const name = req.body.name;

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
	  addPerson(name)
	  res.redirect('/people/add');
	}
  });

});

router.get('/follow/:id', ensureAuthenticated, function (req, res, next) {
	const follow_id = req.params.id;
	const user_id = req.user._id;
	User.findById(user_id, function(err, user){
	  if(err){
		console.log(err);
		return;
	  }
	  Person.findOne({id:follow_id}, function(err, person_follow){
		if(err){
		  console.log(err);
		  return;
		}
		let person_obj = {id: person_follow.id, name:person_follow.name};
		if (containsObjectId(person_obj, user.followedPeople)){
		  res.send("You have followed this person");
		}else{
		  user.followedPeople.push(person_obj)
		  User.updateOne({_id:user_id}, user, function(err){
			if(err){
			  console.log(err);
			  return;
			} else {
			  //res.flash("You have followed this user");
			  res.redirect('/users/profile');
			}
		  });
		}
	  });
	});
});

function containsObjectId(obj, list) {
	for (k = 0; k < list.length; k++) {
		//console.log(obj._id);
		if (list[k].id===obj.id) {
			return true;
		}
	}
	return false;
  }
  
  
router.get('/unfollow/:id', ensureAuthenticated, function (req, res, next) {
	const follow_id = req.params.id;
	const user_id = req.user._id;
	User.findById(user_id, function(err, user){
	  if(err){
		console.log(err);
		return;
	  }
	  Person.findOne({id:follow_id}, function(err, person_follow){
		if(err){
		  console.log(err);
		  return;
		}
		let person_obj = {id: person_follow.id, name:person_follow.name};
		if (!containsObjectId(person_obj, user.followedPeople)){
		  res.send("You have not followed this user yet");
		}else{
		  for (i in user.followedPeople){
			if (user.followedPeople[i].id===person_obj.id){
			  user.followedPeople.splice(i,1);
			}
		  }
		  User.updateOne({_id:user_id}, user, function(err){
			if(err){
			  console.log(err);
			  return;
			} else {
			  //res.flash("You have followed this user");
			  res.redirect('/users/profile');
			}
		  });
		}
	  });
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
		"text/html": () => { res.render("personView", {person: req.person,user:req.user}); }
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
  "text/html": () => {res.render("personList", {people:res.people, qstring: req.qstring, current: req.query.page,user:req.user} )},
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
	addPerson:addPerson,
	addPersonWork:addPersonWork
};
