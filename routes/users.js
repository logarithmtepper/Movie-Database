const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
let User = require("../models/userModel");
nodemailer = require('nodemailer');

//initiate email sender
transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", 
  secureConnection: false, 
  service: 'outlook',
  port: 587, 
  auth: {
      user: "noreplay_database_test@outlook.com",
      pass: "Movie123456"
  },
  tls: {
      rejectUnauthorized: false
  }
});


router.get('/forgotPassword', (req, res, next) => {
  res.render('forgotPassword')
})

router.post('/forgotPassword', (req, res, next) => {
  const email = req.body.email;
  User.findOne({email:email},function(err,user){
    if(err){
      console.log(err);
      return;
    }
    
    if (user===null){
      return res.render('forgotPassword',{
        error: "We can't find this Email address in our record"
      });
    }
    else{
      transporter.sendMail({
        from: 'noreplay_database_test@outlook.com',
        to: user.email,
        subject: 'Your password of Movie Database',
        text: 	"Hello "+user.username+
                ",\n\nHere is your username and password in Movie Database\n"+
                "Username: "+user.username+'\n'+
                "Password: "+user.password+'\n'+
                "\nMovie Database Team"
      }, function(err){
        if(err){
          console.log(err);
          return
        }
        console.log('Message sent');
      });
      res.redirect('login')
    }
  })
})
// Register Form
router.get('/register', function(req, res){
  res.render('register',{
    error: req.err
  });
});

// Register Form
router.post('/register', function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const email = req.body.email;
  if (password!==password2){
    res.render('register',{
      error: "Password does not match"
    });
  }
  if (password.length<6){
    res.render('register',{
      error: "Password need to be at least 6 characters"
    });
  }
  var re = /\S+@\S+\.\S+/;
  if (!re.test(email)){
    res.render('register',{
      error: "Please enter a valid email address"
    });
  }
  else{
    User.findOne({username:username},function(err,user){
      if (user!==null){
        res.render('register',{
          error: "This username exist, choose another one"
        });
      }else{
        let newUser = new User({
          username:username,
          password:password,
          email:email,
          contributing:"n",
          followedUsers: [],
          followedPeople: [],
          reviews: [],
          recommended: [],
          follower: []
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
    })
  }
});

// login form
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

//follow a user
router.get('/follow/:id', ensureAuthenticated, function (req, res, next) {
  const follow_id = req.params.id;
  const user_id = req.user._id;
  User.findById(user_id, function(err, user){
    if(err){
      console.log(err);
      return;
    }
    User.findById(follow_id, function(err, user_follow){
      if(err){
        console.log(err);
        return;
      }
      let user_obj = {_id: user_follow._id, username:user_follow.username};
      if (containsObjectId(user_obj, user.followedUsers)){
        res.send("You have followed this user");
      }else{
        sendNotification(user.follower, user.username);
        user.followedUsers.push(user_obj)
        user_follow.follower.push(user_id)
        User.updateOne({_id:user_follow._id}, user_follow, function(err){
          if(err){
            console.log(err);
            return;
          }
        });
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

//unfollow a user
router.get('/unfollow/:id', ensureAuthenticated, function (req, res, next) {
  const follow_id = req.params.id;
  const user_id = req.user._id;
  User.findById(user_id, function(err, user){
    if(err){
      console.log(err);
      return;
    }
    User.findById(follow_id, function(err, user_follow){
      if(err){
        console.log(err);
        return;
      }
      let user_obj = {_id: user_follow._id, username:user_follow.username};
      if (!containsObjectId(user_obj, user.followedUsers)){
        res.send("You have not followed this user yet");
      }else{
        for (i in user.followedUsers){
          if (user.followedUsers[i]._id.equals(user_obj._id)){
            user.followedUsers.splice(i,1);
          }
        }
        for (i in user_follow.follower){
          if (user_follow.follower[i].equals(user_id)){
            user_follow.follower.splice(i,1);
          }
        }
        User.updateOne({_id:user_follow._id}, user_follow, function(err){
          if(err){
            console.log(err);
            return;
          }
        });
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

//user's profile page
router.get('/profile', ensureAuthenticated, function(req, res){
  res.render('userProfile', {
    user: req.user

  });
});

//user's profile page
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

//for GET /users
router.get("/", queryParser);
router.get("/", loadUsers);
router.get("/", respondUsers);

//for GET /users/:user
router.get("/:id", getUser);
router.get("/:id", sendUser);


router.post('/search', function(req, res, next){
	const searchText = req.body.searchText;
	res.redirect('/users?name=' + searchText);
});

function queryParser(req, res, next){
	const MAX_USER = 66;

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
		if(req.query.limit > MAX_USER){
			req.query.limit = MAX_USER;
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
		"text/html": () => { res.render("userView", {display_user: req.display_user,user:req.user}); }
	});
	next();
}

function loadUsers(req, res, next){
	let startIndex = ((req.query.page-1) * req.query.limit);
  let amount = req.query.limit;

  User.find()
  .where("username").regex(new RegExp(".*" + req.query.name + ".*", "i"))
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
  "text/html": () => {res.render("userList", {users:res.users, qstring: req.qstring, current: req.query.page,user:req.user} )},
  "application/json": () => {res.status(200).json(res.users)}
  });
  next();
}

//helper to change between regular and contributing
function changeContributing(user){
  if (user.contributing === 'y'){
    user.contributing = 'n';
  }else {
    user.contributing = 'y';
  }
}


//ensureAuthenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/users/login');
}

//helper to send notification email
function sendNotification(follower, username) { 
  for (const id of follower){
    User.findById({_id:id}, function(err,user){
      if(err){
        console.log(err);
        return;
      }
      transporter.sendMail({
        from: 'noreplay_database_test@outlook.com',
        to: user.email,
        subject: username+' followed a new user',
        text: 	"Hello "+user.username+
                ",\n\n"+username+' just followed a new user in the database, check it out!'+
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

//helper
function containsObjectId(obj, list) {
  for (k = 0; k < list.length; k++) {
      //console.log(obj._id);
      if (list[k]._id.equals(obj._id)) {
          return true;
      }
  }
  return false;
}
module.exports = router;
