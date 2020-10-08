let request = new XMLHttpRequest();

request.onreadystatechange = function(){
  if(this.readyState == 4 && this.status == 200){
    console.log(request.responseText);

    body.innerHTML = request.responseText
  }
}

request.open("GET", "/login.pug", true);
request.setRequestHeader('Accept', 'text/html');
request.send();
