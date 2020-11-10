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
      if(!genres[i].movies.includes(movie.id)){
        genres[i].movies.push(movie.id);
      }
    }
  }
  for(i=0; i < people.length; i++) {
    if(movie.Director.includes(people[i].name) || movie.Writer.includes(people[i].name) || movie.Actors.includes(people[i].name)){
      if(!people[i].works.includes(movie.id)){
        people[i].works.push(movie.id);
      }
    }
  }
});

function commonItems(arr1, arr2){
  var count = 0;
  for(var movie1 in arr1){
    for(var movie2 in arr2){
      if(movie1 == movie2){
        count+=1;
      }
    }
  }
  return count;
}

function collabMaker(list1){
  var collabs = [];
  for(i=0; i < list1.length; i++){
    //console.log(list1[i])
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

//console.log(collabMaker(people));
//console.log(people);
var collabs = [];
collabs = collabMaker(people);
collabs.sort((a, b) => a.commonIds.localeCompare(b.commonIds))

function containsObject(obj, list) {
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}


for(i=0; i < collabs.length; i++) {
  var indexes = collabs[i].id.split('-');
  var p1 = indexes[0];
  var p2 = indexes[1];

  if(!containsObject(people[p1].collaborators, people[p2]) && !containsObject(people[p2].collaborators, people[p1])){
    people[p1].collaborators.push(people[p2].id);
    people[p2].collaborators.push(people[p1].id);
  }
}

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
      let temp = genres[x].movies
      temp.forEach(movie => {
        m.similar.push(movie);
      });
      m.genre.push(genres[x].name);
    }
  }
  m.similar = removeDuplicates(m.similar);
  for(x = 0; x < people.length; x++){
    if(movies[i].Director.includes(people[x].name)){
      m.director.push(people[x].id);
    }
  }
  for(x = 0; x < people.length; x++){
    if(movies[i].Writer.includes(people[x].name)){
      m.writer.push(people[x].id);
    }
  }
  for(x = 0; x < people.length; x++){
    if(movies[i].Actors.includes(people[x].name)){
      m.actors.push(people[x].id);
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

//When running with large movie data
//memory problem: heap seems to grow exponetially before running out of room and crashing
