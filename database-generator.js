const mongoose = require("mongoose");

const Movie = require("./models/movieModel");
const User = require("./models/userModel");
const Person = require("./models/personModel");
const Genre = require("./models/genreModel");

//create and save movies and people
let movieData = require("./movie-data.json");
//let movieData = require("./movie-data-short.json");

let movies = []; //Stores all of the movies, key=z
let z = 0;
movieData.forEach(movie => {
  if(movie.Title != "#DUPE#"){
    movies[z] = movie;
    movies[z].id = z;
    movies[z].directorObj = [];
    movies[z].writerObj = [];
    movies[z].actorsObj = [];
    movies[z].similarObj = [];
    movies[z].genreObj = [];
    z++;
  }
});

let peopleString = "";
let genreString = "";

movies.forEach(movie => {
  peopleString += [movie.Director + ","];
  peopleString += [movie.Writer + ","];
  peopleString += [movie.Actors + ","];
  genreString += [movie.Genre + ","];
});

let peopleList = peopleString.split(',');
let genreList = genreString.split(',');

peopleList = stringCleaner(peopleList);
peopleList = removeDuplicates(peopleList);

//Some misplaced commas in the json we're causing extra people to be created. This function removes them.
for(i=0; i < peopleList.length; i++){
  if(peopleList[i].includes("(") || peopleList[i].includes(")")){
    peopleList.splice(i, 1);
  }
}

genreList = stringCleaner(genreList);
genreList = removeDuplicates(genreList);

let genres = [];
for(i=0; i < genreList.length-1; i++) {
  genres[i] = {
    id: i,
		name: genreList[i],
		movies: []
	}
}

let people = [];
for(i=0; i < peopleList.length-1; i++) {
  people[i] = {
    id: i,
		name: peopleList[i],
		works: [],
		collaborators: []
	}
}

movies.forEach(movie => {
  for(i=0; i < genres.length; i++) {
    if(movie.Genre.includes(genres[i].name)){
      if(!genres[i].movies.includes({id: movie.id, name: movie.Title})){
        genres[i].movies.push({id: movie.id, name: movie.Title});
      }
      if(movies.similarObj == null){
        let temp = genres[i].movies
        for (x=0; x < 2; x++){
          let y = Math.floor(Math.random() * temp.length);
          if(temp[y].id != movie.id && temp[y] && !containsObjectId(temp[y], movie.similarObj)){
            movie.similarObj.push(temp[y]);
          }
        }
      }
      movie.genreObj.push(genres[i].name);
    }
  }
  for(i=0; i < people.length; i++) {
    if(movie.Director.includes(people[i].name)){
      if(!containsObjectId(movie, people[i].works)){
        people[i].works.push({id: movie.id, name: movie.Title});
      }
      movie.directorObj.push({id: people[i].id, name: people[i].name});
    }

    if(movie.Writer.includes(people[i].name)){
      if(!containsObjectId(movie, people[i].works)){
        people[i].works.push({id: movie.id, name: movie.Title});
      }
      movie.writerObj.push({id: people[i].id, name: people[i].name});
    }

    if(movie.Actors.includes(people[i].name)){
      if(!containsObjectId(movie, people[i].works)){
        people[i].works.push({id: movie.id, name: movie.Title});
      }
      movie.actorsObj.push({id: people[i].id, name: people[i].name});
    }
  }
});

var collabs = [];
collabs = collabMaker(people);

for(i=0; i < collabs.length; i++) {
  var indexes = collabs[i].id.split('-');
  var p1 = indexes[0];
  var p2 = indexes[1];

  if(!containsObjectId(people[p1].collaborators, people[p2]) && !containsObjectId(people[p2].collaborators, people[p1])){
    people[p1].collaborators.push({id: people[p2].id, name: people[p2].name});
    people[p2].collaborators.push({id: people[p1].id, name: people[p1].name});
  }
}

let schemaMovies = [];
let schemaPeople = [];
let schemaGenres = [];
for(let i = 0; i < movies.length; i++){
	let m = new Movie();
  m.id = i;
	m.title = movies[i].Title;
  m.rated = movies[i].Rated;
  m.released = movies[i].Released;
  m.runtime = movies[i].Runtime;
  m.similar = movies[i].similarObj;
  m.genre = movies[i].genreObj;
  m.director = movies[i].directorObj;
  m.writer = movies[i].writerObj;
  m.actors = movies[i].actorsObj;
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

for(let i = 0; i < genres.length; i++){
	let g = new Genre();
  g.id = i;
  g.name = genres[i].name;
  g.movies = genres[i].movies;
	schemaGenres.push(g);
}

schemaMovies.sort((a, b) => a.title.localeCompare(b.title))
schemaPeople.sort((a, b) => a.name.localeCompare(b.name))
schemaGenres.sort((a, b) => a.name.localeCompare(b.name))

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

		console.log("Dropped database. Re-creating.");

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

    let completedGenres = 0;
		schemaGenres.forEach(genre => {
			genre.save(function(err,result){
				if(err) throw err;
				completedGenres++;
				if(completedGenres >= genres.length){
					console.log(completedGenres + " genres saved");
				}
			})
		});

	});
});

function setCharAt(str,index,chr) {
  return str.substr(0,index) + chr + str.substr(index+1);
}

function removeDuplicates(arr) {
  return arr.filter((a, b) => arr.indexOf(a) === b)
}

function stringCleaner(arr) {
  let newArr = [];
  for(d = 0; d < arr.length; d++){
    var temp = "";
    for(b = 0; b < arr[d].length; b++){
      if(arr[d][b] == '('){
        break;
      }
      temp += arr[d][b];
    }
    let temptemp = temp;
    temp = temp.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
    newArr.push(temp);
  }
  return newArr;
}

function containsObjectId(obj, list) {
    for (k = 0; k < list.length; k++) {
        if (list[k].id === obj.id) {
            return true;
        }
    }
    return false;
}

function commonItems(arr1, arr2){
  var count = 0;
  arr1.forEach(movie1 => {
    arr2.forEach(movie2 => {
      if(movie1.id == movie2.id){
        count+=1;
      }
    });
  });
  return count;
}

function collabMaker(list1){
  var collabs = [];
  for(i=0; i < list1.length; i++){
    for(x=i; x < list1.length; x++){
      if(list1[i].id !== list1[x].id){
        var commonWorks = commonItems(list1[i].works, list1[x].works);
        if(commonWorks >= 2){
          var commonIds = `${list1[i].id}-${list1[x].id}`;
          var dict = {};
          dict = {
            id: commonIds,
            commonIds: commonWorks
          };
          collabs.push(dict);
        }
      }
    }
  }
  return collabs;
}
