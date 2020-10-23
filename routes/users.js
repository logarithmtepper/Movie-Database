const express = require('express');
const router = express.Router();
const passport = require('passport');
let users = require("../users.json");
const fs = require('fs');


function isValidUser(userObj){
  if(!userObj){
    return false;
  }
  if(!userObj.username || !users.hasOwnProperty(userObj.username)){
    return false;
  }
  return true;
}


function createUser(newUser){
  if(!newUser.username || !newUser.password){
    return null;
  }
  if(users.hasOwnProperty(newUser.username)){
    return null;
  }
  newUser.contributing = 'n';
  newUser.followedUser = [];
  newUser.followedPeople = [];
  newUser.reviews = [];

  users[newUser.username] = newUser;
  return users[newUser.username];
}


var login =function(user,password){
  for(u in users){
    let theUser = users[u];
    //console.log(theUser.username);
    if (theUser.username === user && password===theUser.password){
      return true;
    }
  }
  return false;
}



// Register Form
router.get('/register', function(req, res){
  res.render('register');
});

router.post('/register', function(req, res, next){
  const username = req.body.username;
  //const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;
  if (password!==password2){
    res.send("Password does not match");
  }else{
    let a = createUser({username: username, password: password})

    fs.writeFile('./users.json', JSON.stringify(users), function(err) {  
      if (err) throw err;
      //console.log('complete');
    });

    if(a == null){
      //console.log("null");
      //res.send("account is exist, Please log in!")
      res.render('register');
      //account exist 
    } 
    else {
    //req.flash('success','You are now registered and can log in');
      res.redirect('login');
    }
  }
});


router.get('/login', function(req, res){
  res.render('login');
});
/* GET users listing. */
router.post('/login', function (req, res, next) {

  const username = req.body.uname;
  //console.log(username);
  let loginResult = login(username, req.body.psw);

  if (loginResult) {
      res.render('userProfile', {username: username});
  }
  else {
      res.render('login', {error: true});
  }
});


//log out
router.get('/logout', function(req, res){
  //req.logout();
  //req.flash('success', 'You are logged out');
  res.redirect('/');
});

module.exports = router;