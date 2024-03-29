const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel');

//const bcrypt = require('bcryptjs');

module.exports = function(passport){
  // Local Strategy
  passport.use(new LocalStrategy(function(username, password, done){
    // Match Username
    let query = {username:username};
    User.findOne(query, function(err, user){
        
        if(err) throw err;
        if(!user){
            console.log("not user");
            return done(null, false, {message: 'No user found'});
        }
        if (password===user.password){
            return done(null, user);
        } else {
            console.log("Wrong password");
            return done(null, false, {message: 'Wrong password'});
        }
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}