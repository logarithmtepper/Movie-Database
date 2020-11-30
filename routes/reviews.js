const express = require('express');
const router = express.Router();
const Review = require("../models/reviewModel");
const Movie = require("../models/movieModel");
let User = require("../models/userModel");
//




router.get('/add/:id', ensureAuthenticated, function(req, res){
    let id = req.params.id;
    let user = req.user;
    Movie.findOne({id:id}, function (err, result) {
        if(err){
			res.status(500).send("Error reading movies.");
			console.log(err);
			return;
        }
        else{
            res.movie = result;
            movie_obj = {id:result.id,title:result.title}
            user_obj = {_id:user._id,name:user.username}
            const temp = result.ratings.filter(x=>user.username.includes(x.Source))
            if (temp.length>0){
                Review.findOne({reviewer:user_obj,movie:movie_obj}, function(err, review){
                    if(err){
                        res.status(500).send("Error reading reviews.");
                        console.log(err);
                        return;
                    }
                    req.review = review;
                    res.render('editReview',{
                        user: user,
                        review: review,
                        error: ""
                    });
                    return 
                })
            }else{
                return res.render('addReview',{
                    user: req.user,
                    movie: result,
                    title: result.title
                });
            } 
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
            movieReview = {Source:user_obj.name, Value:rating}
            movie.ratings.push(movieReview);
            user.reviews.push(review_obj);
            movie.similar.forEach(movieObj => {
              user.recommended.push(movieObj);
            });
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


router.get('/edit/:id', ensureAuthenticated, function(req, res){
    res.render('editReview',{
        user: req.user
    })
})

router.post('/edit/:id', ensureAuthenticated, function(req, res){
    const user = req.user;
    const review_id = req.params.id;
    const title = req.body.title;
    const full = req.body.full;
    const rating = req.body.rating;
    Review.findById({_id:review_id}, function(err,review){

        review.title= title;
        review.full= full;
        review.rating= rating;
        Movie.findOne({id:review.movie.id}, function (err, movie) {
            if(err){
			    res.status(500).send("Error reading movies.");
			    console.log(err);
			    return;
            }
            else{
                user_obj = {_id:user._id,name:user.username} 
                Review.updateOne({_id:review_id}, review, function(err){
                    if(err){
                        res.status(500).send("Error reading reviews.");
                        console.log(err);
                        return;
                    }
                })
                review_obj = {_id:review_id,movie_id:movie.id,title:review.title,rating:review.rating,movie:movie.title}
                movieReview = {Source:user_obj.name, Value:rating}
                for (i in movie.ratings){
                    if(movie.ratings[i].Source===user.username){
                        movie.ratings[i]=movieReview;
                    }
                }
                //.map(a=>{if(a.Source===user.username)a=movieReview;console.log(a)});
                console.log(movie.ratings)
                user.reviews.map(x=>{if(x._id===review_obj._id)x=review_obj});
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
            }               
            res.redirect('/movies/' + movie.id);
        })
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
