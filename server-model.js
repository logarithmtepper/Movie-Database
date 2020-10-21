let movieData = require("./movie-data-short.json");
let movies = {}; //Stores all of the movies, key=imdbID
movieData.forEach(movie => {
  movies[movie.imdbID] = movie;
});

let peopleString = "";
movieData.forEach(movie => {
  peopleString += [movie.Director + ","];
  peopleString += [movie.Writer + ","];
  peopleString += [movie.Actors + ","];
});

let peopleList = peopleString.split(',');

//we can just modify the JSON instead of doing this ill fix it latr
peopleList = peopleList.map(function(d) { return d.replace(' (original story by)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (screenplay by)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (screen story by)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (screenplay)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (story)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (story)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (based on the book by)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (characters)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (novel)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (screenplay \"Father\'s Little Dividend\")', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (play)', ''); });
peopleList = peopleList.map(function(d) { return d.replace(' (earlier screenplay)', ''); });

function setCharAt(str,index,chr) {
	return str.substr(0,index) + chr + str.substr(index+1);
}

function removeDuplicates(array) {
  return array.filter((a, b) => array.indexOf(a) === b)
};

for(i=0; i < peopleList.length; i++) {
  if(peopleList[i].charAt(0) === " "){
    peopleList[i] = setCharAt(peopleList[i],0,'');
  }
}

peopleList = removeDuplicates(peopleList);

let people = [];
for(i=0; i < peopleList.length-1; i++) {
  people[i] = {
		name: peopleList[i],
		works: [],
		collaborators: [],
	}
}

movieData.forEach(movie => {
  for(i=0; i < people.length; i++) {
    if(movie.Director.includes(people[i].name) || movie.Writer.includes(people[i].name) || movie.Actors.includes(people[i].name)){
      //&& !people[i].works.includes(movie.Title) && !people[i].collaborators.includes(movie.Director)
      if(!people[i].works.includes(movie.Title)){
        people[i].works += movie.Title;
      }
    }
    //if(movie.Writer.includes(people[i].name)){
    //}
    //if(movie.Actors.includes(people[i].name)){
    //}
  }
});
//we have now a "people" object array that has names and works


//console.log(movies);
//console.log(people);
