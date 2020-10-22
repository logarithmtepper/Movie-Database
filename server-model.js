let movieData = require("./movie-data-short.json");
let userData = require("./users.json");
let peopleData = require("./people.json");


let movies = []; //Stores all of the movies, key=imdbID
let z = 0;
movieData.forEach(movie => {
  movies[z] = movie;
  z++;
});

let peopleString = "";
movieData.forEach(movie => {
  peopleString += [movie.Director + ","];
  peopleString += [movie.Writer + ","];
  peopleString += [movie.Actors + ","];
});

let peopleList = peopleString.split(',');

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
		collaborators: []
	}
}

movieData.forEach(movie => {
  for(i=0; i < people.length; i++) {
    if(movie.Director.includes(people[i].name) || movie.Writer.includes(people[i].name) || movie.Actors.includes(people[i].name)){
      if(!people[i].works.includes(movie.Title)){
        people[i].works.push(movie.Title);
      }
    }
  }
});

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
      tempList = tempList.map(function(d) { return d.replace(' (original story by)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (screenplay by)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (screen story by)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (screenplay)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (story)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (story)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (based on the book by)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (characters)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (novel)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (screenplay \"Father\'s Little Dividend\")', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (play)', ''); });
      tempList = tempList.map(function(d) { return d.replace(' (earlier screenplay)', ''); });
      for(y=0; y < tempList.length; y++) {
        if(tempList[y].charAt(0) === " "){
          tempList[y] = setCharAt(tempList[y],0,'');
        }
      }
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

//yes i know this looks awful
console.log(movies);
console.log(people);
