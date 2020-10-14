let movieData = require("./movie-data.json");
let movies = {}; //Stores all of the movies, key=Title
movieData.forEach(movie => {
  movies[movie.Title] = movie;
});


//const express = 