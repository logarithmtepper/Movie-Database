const mongoose = require("mongoose");
const Movie = require("./movieModel");
const User = require("./userModel");
const Person = require("./personModel");

//create and save movies and people
let movieData = require("./movie-data-short.json");

let movies = []; //Stores all of the movies, key=z
let z = 0;
movieData.forEach(movie => {
  movies[z] = movie;
  movies[z].id = z;
  z++;
});

let peopleString = "";
let genreString = "";
movieData.forEach(movie => {
  peopleString += [movie.Director + ","];
  peopleString += [movie.Writer + ","];
  peopleString += [movie.Actors + ","];
  genreString += [movie.Genre + ","];
});

let peopleList = peopleString.split(',');
let genreList = genreString.split(',');

function setCharAt(str,index,chr) {
	return str.substr(0,index) + chr + str.substr(index+1);
}

function removeDuplicates(arr) {
    return arr.filter((a, b) => arr.indexOf(a) === b)
}

function stringCleaner(arr) {
  let newArr = [];
  for (var s of arr){
    var temp = "";
    for (var c of s){
      if(c == '('){
        break;
      }
      temp += c;
    }
    temp = temp.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
    newArr.push(temp);
  }
  return newArr;
}

peopleList = stringCleaner(peopleList);
peopleList = removeDuplicates(peopleList);

genreList = stringCleaner(genreList);
genreList = removeDuplicates(genreList);

let genres = [];
for(i=0; i < genreList.length-1; i++) {
  genres[i] = {
    id: [i],
		name: genreList[i],
		movies: []
	}
}

let people = [];
for(i=0; i < peopleList.length-1; i++) {
  people[i] = {
    id: [i],
		name: peopleList[i],
		works: [],
		collaborators: []
	}
}

movieData.forEach(movie => {
  for(i=0; i < people.length; i++) {
    if(movie.Director.includes(people[i].name) || movie.Writer.includes(people[i].name) || movie.Actors.includes(people[i].name)){
      if(!people[i].works.includes(movie.Title)){
        people[i].works.push(movie);
      }
    }
  }
});

movieData.forEach(movie => {
  for(i=0; i < genres.length; i++) {
    if(movie.Genre.includes(genres[i].name)){
      if(!genres[i].movies.includes(movie)){
        genres[i].movies.push(movie);
      }
    }
  }
});

/*
let collaboratorsString = '';
let collaboratorsList = [];
let seenCollaborators = {};
let tempList = [];

for(x=0; x < people.length; x++){
  collaboratorsList = [];
  collaboratorsString = '';
  seenCollaborators = {};

  for(i=0; i < movies.length; i++) {
    tempList = [];
    collaboratorsString = '';
    if(people[x].works.includes(movies[i].Title)){
      collaboratorsString += [movies[i].Director + ","];
      collaboratorsString += [movies[i].Writer + ","];
      collaboratorsString += [movies[i].Actors + ","];
      tempList = collaboratorsString.split(',');

      tempList = stringCleaner(tempList);
      tempList = removeDuplicates(tempList);
      tempList = tempList.map(function(d) { return d.replace(people[x].name, ''); });

      collaboratorsList.push(...tempList);
    }
  }

  for (i=0; i < collaboratorsList.length; i++) {
    const collaborator = collaboratorsList[i];
    seenCollaborators[collaborator] = 1 + (seenCollaborators[collaborator] || 0);
    if (seenCollaborators[collaborator] === 2) people[x].collaborators.push(collaborator);
  }
}
*/

let schemaMovies = [];
let schemaPeople = [];
for(let i = 0; i < movies.length; i++){
	let m = new Movie();
  m.id = i;
	m.title = movies[i].Title;
  m.rated = movies[i].Rated;
  m.released = movies[i].Released;
  m.runtime = movies[i].Runtime;
  for(x = 0; x < genres.length; x++){
    if(movies[i].Genre.includes(genres[x].name)){
      m.similar.push(...genres[x].movies);
      m.genre.push(genres[x]);
    }
  }
  m.similar = removeDuplicates(m.similar);
  for(x = 0; x < people.length; x++){
    if(movies[i].Director.includes(people[x].name)){
      m.director.push(people[x]);
    }
  }
  for(x = 0; x < people.length; x++){
    if(movies[i].Writer.includes(people[x].name)){
      m.writer.push(people[x]);
    }
  }
  for(x = 0; x < people.length; x++){
    if(movies[i].Actors.includes(people[x].name)){
      m.actors.push(people[x]);
    }
  }
  m.plot = movies[i].Plot;
  m.language = movies[i].Language;
  m.poster = movies[i].Poster;
  m.ratings = movies[i].Ratings
	schemaMovies.push(m);
}

for(let i = 0; i < people.length; i++){
	let p = new Person();
  p.id = i;
  p.name = people[i].name;
  p.works = people[i].works;
  p.collaborators = people[i].collaborators;
	schemaPeople.push(p);
}

schemaPeople.sort((a, b) => a.name.localeCompare(b.name))
schemaMovies.sort((a, b) => a.title.localeCompare(b.title))

mongoose.connect('mongodb://localhost/database', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	mongoose.connection.db.dropDatabase(function(err, result){
		if(err){
			console.log("Error dropping database:");
			console.log(err);
			return;
		}

		console.log("Dropped database. Starting re-creation.");

		let completedMovies = 0;
		schemaMovies.forEach(movie => {
			movie.save(function(err,result){
				if(err) throw err;
				completedMovies++;
				if(completedMovies >= movies.length){
					console.log(completedMovies + " movies saved");
				}
			})
		});

    let completedPeople = 0;
		schemaPeople.forEach(person => {
			person.save(function(err,result){
				if(err) throw err;
				completedPeople++;
				if(completedPeople >= people.length){
					console.log(completedPeople + " people saved");
				}
			})
		});

	});
});
