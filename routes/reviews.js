const express = require('express');
const router = express.Router();
const Review = require("../models/reviewModel");
const Movie = require("../models/movieModel");
let User = require("../models/userModel");
//




router.get('/add/:id', ensureAuthenticated, function(req, res){
    let id = req.params.id;
    Movie.findOne({id:id}, function (err, result) {
        if(err){
			res.status(500).send("Error reading movies.");
			console.log(err);
			return;
        }
        else{
            res.movie = result;
            res.render('addReview',{
                user:req.user,  
                movie: result,
                title: result.title
            });
        }
    })

});

router.post('/add/:id', ensureAuthenticated, function(req, res){
    let user = req.user;
    let id = req.params.id;
    const title = req.body.title;
    const full = req.body.full;
    const rating = req.body.rating;
    Movie.findOne({id:id}, function (err, movie) {
        if(err){
			res.status(500).send("Error reading movies.");
			console.log(err);
			return;
        }
        else{
            user_obj = {_id:user._id,name:user.username}
            movie_obj = {id:movie.id,title:movie.title}

            let newReview = new Review({
                title: title,
                full: full,
                rating: rating,
                reviewer:user_obj,
                movie:movie_obj
            })
            review_obj = {_id:newReview._id,movie_id:movie.id,title:newReview.title,rating:newReview.rating, movie:movie.title}
            //movie.ratings.push(review_obj);
            user.reviews.push(review_obj);
            Movie.updateOne({title:movie.title}, movie, function(err){
                if(err){
                  console.log(err);
                  return;
                }
            });
            User.updateOne({_id:user._id}, user, function(err){
                if(err){
                  console.log(err);
                  return;
                }
            });
            newReview.save(function(err){
                if(err){
                    console.log(err);
                    return;
                }
            });
            res.redirect('/movies/' + movie.id);
        }
    })

});



router.get("/:id", getReview);
router.get("/:id", sendReview);

function getReview(req, res, next){
  let id = req.params.id;
  Review.findOne({_id:id}, function (err, result) {
		if(err){
			res.status(500).send("Error reading users.");
			console.log(err);
			return;
		}
		req.review = result;
		next();
		return;
	});
}

function sendReview(req, res, next){
  res.format({
		"application/json": function(){
			res.status(200).json(req.review);
		},
		"text/html": () => { res.render("reviewView", {review: req.review, user:req.user}); }
	});
	next();
}




function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/users/login');
}



module.exports = router;
