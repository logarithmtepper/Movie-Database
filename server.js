const http = require('http');
const fs = require('fs');

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

    if(request.url === '/' || request.url === '/server.html'){
      processRequest("server.html", "text/html")
    }

    else if(request.url === "/login.html"){
			processRequest("login.html", "text/html")
		}

    else if(request.url === "/loginStyle.css"){
			processRequest("loginStyle.css", "text/css")
		}

    else if(request.url === "/signUp.html"){
			processRequest("signUp.html", "text/html")
		}

    else if(request.url === "/signUpStyle.css"){
			processRequest("signUpStyle.css", "text/css")
		}

    else if(request.url === "/addMovie.html"){
			processRequest("addMovie.html", "text/html")
		}

    else if(request.url === "/addMovieStyle.css"){
			processRequest("addMovieStyle.css", "text/css")
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
