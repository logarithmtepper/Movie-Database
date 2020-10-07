function createAccount(){
  let request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      console.log(request.responseText);
      //update page here
    }
  }

  request.open("GET", "/signUp.html", true);
  request.setRequestHeader('Accept', 'text/html');
  request.send();
}
