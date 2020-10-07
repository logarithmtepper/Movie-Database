funtcion createAccount(){
  let request = new XMLHttpRequest();

  request.open("GET", "/signUp", true);
  request.setRequestHeader('Accept', 'text/html');
  request.send();
}
