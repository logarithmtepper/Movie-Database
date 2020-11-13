const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
let User = require("../models/userModel");
const ObjectId= require('mongoose').Types.ObjectId


// Register Form
router.get('/register', function(req, res){
  res.render('register');
});

router.post('/register', function(req, res, next){
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  if (password!==password2){
    res.send("Password does not match");
  }else{
    let newUser = new User({
      username:username,
      password:password,
      contributing:"n",
      followedUsers: [],
      followedPeople: [],
      reviews: []
    })
    newUser.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
      res.redirect('login');
      }

    });
  }
});


router.get('/login', function(req, res){
  res.render('login',{
    //user:user
  });
});


/* GET users listing. */
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect:'/users/profile',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/follow/:id', ensureAuthenticated, function (req, res, next) {
  const id = req.params.id;
  const user_id = req.user._id;
  User.findById(user_id, function(err, user){
    if (user.followedUsers.includes(id)){
      res.send("You have followed this user");
    }else{
      user.followedUsers.push(id)
      User.updateOne({_id:user_id}, user, function(err){
        if(err){
          console.log(err);
          return;
        } else {
          //res.flash("You have followed this user");
          res.redirect('/users/'+id);
        }
      });
    }
  });

});
router.get('/unfollow/:id', ensureAuthenticated, function (req, res, next) {
  const id = req.params.id;
  const user_id = req.user._id;
  User.findById(user_id, function(err, user){
    if (user.followedUsers.includes(id)){
      const index = user.followedUsers.indexOf(id);
      user.followedUsers.splice(index,1);
      User.updateOne({_id:user_id}, user, function(err){
        if(err){
          console.log(err);
          return;
        } else {
          //res.flash("You have unfollowed this user");
          res.redirect('/users/'+id);
        }
      });
    }else{
      res.send("You have not followed this user yet");
    }
  });

});
router.get('/profile', ensureAuthenticated, function(req, res){
  res.render('userProfile', {
    user: req.user
  })
});

router.post('/profile', ensureAuthenticated, function(req, res){
  let user = req.user
  changeContributing(user);
  let query ={_id:req.user._id}
  User.updateOne(query, user, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      res.redirect('/users/profile');
    }
  });
});


//log out
router.get('/logout', function(req, res){
  req.logout();
  //req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});


//for GET /home
router.get("/", queryParser);
router.get("/", loadUsers);
router.get("/", respondUsers);


router.get("/:id", getUser);
router.get("/:id", sendUser);


function queryParser(req, res, next){
	const MAX_USER = 48;

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
		if(req.query.limit > MAX_USER){
			req.query.limit = MAX_USER;
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

function getUser(req, res, next){
  let id = req.params.id;
  User.findOne({_id:id}, function (err, result) {
		if(err){
			res.status(500).send("Error reading users.");
			console.log(err);
			return;
		}
		req.display_user = result;
		next();
		return;
	});
}

function sendUser(req, res, next){
  res.format({
		"application/json": function(){
			res.status(200).json(req.display_user);
		},
		"text/html": () => { res.render("userView", {display_user: req.display_user}); }
	});
	next();
}

function loadUsers(req, res, next){
	let startIndex = ((req.query.page-1) * req.query.limit);
  let amount = req.query.limit;

  User.find()
  .limit(amount)
  .skip(startIndex)
  .exec(function(err, results){
		if(err){
			res.status(500).send("Error reading users.");
			console.log(err);
			return;
		}
		console.log("Found " + results.length + "  users");
		res.users = results;
		next();
		return;
	})
}

function respondUsers(req, res, next){
	res.format({
  "text/html": () => {res.render("userList", {users:res.users, qstring: req.qstring, current: req.query.page } )},
  "application/json": () => {res.status(200).json(res.users)}
  });
  next();
}

function changeContributing(user){
  if (user.contributing === 'y'){
    user.contributing = 'n';
  }else {
    user.contributing = 'y';
  }
}



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/users/login');
}
function forwardAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
      return next();
  }
  res.redirect('/profile');
}

module.exports = router;
