const http = require('http');

const fs = require('fs');

const server = http.createServer(function (request, response) {
  console.log("URL: " + request.url);

  if(request.method === 'GET'){
    
    if(request.url === '/' || request.url === '/login.html'){
      fs.readFile("login.html", function(err, data){
				if(err){
					response.statusCode = 500;
					response.write("Server error.");
					response.end();
					return;
				}
				response.statusCode = 200;
				response.setHeader("Content-Type", "text/html");
				response.write(data);
				response.end();
			});
    }

    else if(request.url === "/loginStyle.css"){
			fs.readFile("loginStyle.css", function(err, data){
				if(err){
					response.statusCode = 500;
					response.write("Server error.");
					response.end();
					return;
				}
				response.statusCode = 200;
				response.setHeader("Content-Type", "text/css");
				response.write(data);
				response.end();
			});
		}

    else if(request.url === "/loginApp.js"){
			fs.readFile("loginApp.js", function(err, data){
				if(err){
					response.statusCode = 500;
					response.write("Server error.");
					response.end();
					return;
				}
				response.statusCode = 200;
				response.setHeader("Content-Type", "application/javascript");
				response.write(data);
				response.end();
			});
		}

    else if(request.url === "/signUp"){
			fs.readFile("signUp.html", function(err, data){
				if(err){
					response.statusCode = 500;
					response.write("Server error.");
					response.end();
					return;
				}
				response.statusCode = 200;
				response.setHeader("Content-Type", "text/html");
				response.write(data);
				response.end();
			});
		}

    else{
			response.statusCode = 404;
			response.write("Unknwn resource.");
			response.end();
		}
	}else if(request.method === "POST"){
		//any handling in here
		response.statusCode = 404;
		response.write("Unknwn resource.");
		response.end();
  }
});

server.listen(3000);
console.log('Server running at port 3000');
