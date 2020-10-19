let movieData = require("./movie-data-short.json");
let movies = {}; //Stores all of the movies, key=imdbID
movieData.forEach(movie => {
  movies[movie.imdbID] = movie;
});

console.log(movies);
//const express =
