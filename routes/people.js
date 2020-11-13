const express = require('express');
const router = express.Router();
const Person = require("../models/personModel");

router.get("/", queryParser);
router.get("/", loadPeople);
router.get("/", respondPeople);

router.get('/add/person', function(req, res){
	res.render('addPerson.pug');
});

router.get("/:id", getPerson);
router.get("/:id", sendPerson);

function queryParser(req, res, next){
	const MAX_PEOPLE = 48;

	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");

	try{
		req.query.limit = req.query.limit || 48;
		req.query.limit = Number(req.query.limit);
		if(req.query.limit > MAX_PEOPLE){
			req.query.limit = MAX_PEOPLE;
		}
	}catch{
		req.query.limit = 48;
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

module.exports = router;
