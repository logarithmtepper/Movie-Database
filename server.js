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
			//read todo.js file and send it back
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
		//Add any more 'routes' and their handling code here
		//e.g., GET requests for "/list", POST request to "/list"
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
