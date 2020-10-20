const http = require('http');
const fs = require('fs');
const pug = require('pug');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
//const movieData = require("./movie-data-short.json");

const app = express();

/*const movieRoutes = (app, fs) => {
  const dataPath = './movie-data-short.json';
  app.get('/movies', (req, res) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      res.send(JSON.parse(data));
    });
  });
};

module.exports = movieRoutes;
TRYING TO GET THE SERVER TO SERVE THE MOVIE JSON DATA
*/

const model = require("./server-model.js");

app.use("/", express.static('./'));
app.use(express.json());

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('home.pug')
})

app.get('/login', (req, res) => {
  res.render('login.pug')
})

app.get('/signUp', (req, res) => {
  res.render('signUp.pug')
})

app.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword.pug')
})

app.get('/addMovie', (req, res) => {
  res.render('addMovie.pug')
})

app.get('/addPerson', (req, res) => {
  res.render('addPerson.pug')
})

app.get('/movieView', (req, res) => {
  res.render('movieView.pug')
})

app.get('/personView', (req, res) => {
  res.render('personView.pug')
})

app.get('/userView', (req, res) => {
  res.render('userView.pug')
})
app.get('/userProfile', (req, res) => {
  res.render('userProfile.pug')
})

app.listen(3000, function () {
  console.log('Server running at port 3000');
});


//const expressLayouts = require('express');
//OLD CODE
/*
const renderAddMovie = pug.compileFile("./addMovie.pug");
const renderaddPerson = pug.compileFile("./addPerson.pug");
const renderForgotPassword = pug.compileFile("./forgotPassword.pug");
const renderHome = pug.compileFile("./home.pug");
const renderLogin = pug.compileFile("./login.pug");
const renderMovieView = pug.compileFile("./movieView.pug");
const renderPersonView = pug.compileFile("./personView.pug");
const renderSignUp = pug.compileFile("./signUp.pug");
const renderUserProfile = pug.compileFile("./userProfile.pug");
const renderUserView = pug.compileFile("./userView.pug");

const server = http.createServer(function (request, response) {
  console.log("URL: " + request.url);

  function processRequest(filename, contentType){
    fs.readFile(filename, function(err, data){
      if(err){
        response.statusCode = 500;
        response.write("Server error.");
        response.end();
        return;
      }
      response.statusCode = 200;
      response.setHeader("Content-Type", contentType);
      response.write(data);
      response.end();
    });
  }

  if(request.method === 'GET'){

    if(request.url === '/' || request.url === '/login.pug'){
      let content = renderLogin();
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
    }

    else if(request.url === "/loginStyle.css"){
			processRequest("loginStyle.css", "text/css")
		}

    else if(request.url === "/addMovie"){
      let content = renderAddMovie({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
		}

    else if(request.url === "/addMovieStyle.css"){
			processRequest("addMovieStyle.css", "text/css")
		}

    else if(request.url === "/addPerson"){
      let content = renderaddPerson({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
		}

    else if(request.url === "/addPersonStyle.css"){
			processRequest("addPersonStyle.css", "text/css")
		}

    else if(request.url === "/forgotPassword"){
      let content = renderForgotPassword({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
    }

    else if(request.url === "/forgotPasswordStyle.css"){
      processRequest("forgotPasswordStyle.css", "text/css")
    }

    else if(request.url === "/home"){
      let content = renderHome({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
		}

    else if(request.url === "/homeStyle.css"){
			processRequest("homeStyle.css", "text/css")
		}

    else if(request.url === "/movieView"){
      let content = renderMovieView({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
		}

    else if(request.url === "/movieViewStyle.css"){
			processRequest("movieViewStyle.css", "text/css")
		}

    else if(request.url === "/personView"){
      let content = renderPersonView({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
		}

    else if(request.url === "/personViewStyle.css"){
			processRequest("personViewStyle.css", "text/css")
		}

    else if(request.url === "/signUp"){
      let content = renderSignUp({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
		}

    else if(request.url === "/signUpStyle.css"){
			processRequest("signUpStyle.css", "text/css")
		}

    else if(request.url === "/userProfile"){
      let content = renderUserProfile({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
		}

    else if(request.url === "/userProfileStyle.css"){
			processRequest("userProfileStyle.css", "text/css")
		}

    else if(request.url === "/userView"){
      let content = renderUserView({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
		}

    else if(request.url === "/userViewStyle.css"){
			processRequest("userViewStyle.css", "text/css")
		}

    else if(request.url === "/serverApp.js"){
			processRequest("serverApp.js", "application/javascript")
		}

    else{
			response.statusCode = 404;
			response.write("Unknwn resource.");
			response.end();
		}
	}else if(request.method === "POST"){
		//handling goes here
		response.statusCode = 404;
		response.write("Unknwn resource.");
		response.end();
  }
});

*/

//server.listen(3000);
//console.log('Server running at port 3000');

//app.use(expressLayouts)
