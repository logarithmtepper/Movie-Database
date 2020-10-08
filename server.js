const http = require('http');
const fs = require('fs');
const pug = require('pug');

const renderLogin = pug.compileFile("./login.pug");
const renderSignUp = pug.compileFile("./signUp.pug");
const renderForgotPassword = pug.compileFile("./forgotPassword.html");
const renderAddMovie = pug.compileFile("./addMovie.pug");
const renderaddPerson = pug.compileFile("./addPerson.html");

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
      //processRequest("login.html", "text/html")
      let content = renderLogin();
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
    }

    else if(request.url === "/loginStyle.css"){
			processRequest("loginStyle.css", "text/css")
		}

    else if(request.url === "/signUp"){
      //processRequest("signUp.html", "text/html")
      let content = renderSignUp({});
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(content);
      response.end();
		}

    else if(request.url === "/signUpStyle.css"){
			processRequest("signUpStyle.css", "text/css")
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

server.listen(3000);
console.log('Server running at port 3000');
