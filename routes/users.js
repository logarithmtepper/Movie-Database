const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
let users = require("../users.json");
let User = require("../userModel");
const ObjectId= require('mongoose').Types.ObjectId


/*
//for GET /home
router.get("/", queryParser);


router.get("/:id", getUser);
router.get("/:id", sendUser);
*/


function changeContributing(user){
  if (user.contributing === 'y'){
    user.contributing = 'n';
  }else {
    user.contributing = 'y';
  }
}

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
  res.render('login');
});


/* GET users listing. */
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect:'/users/profile',
    failureRedirect:'/users/login',
    failureFlash: false
  })(req, res, next);
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


router.get('/userlist', ensureAuthenticated, function(req, res){
  res.render('userList', {
    user: User
  })
});

//log out
router.get('/logout', function(req, res){
  req.logout();
  //req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});


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
