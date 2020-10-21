const express = require('express');
const router = express.Router();


var login =function(user,password){
  //add
  if(user==="ivoryzhang" && password==="123456"){
      return true;
  }
  else{
      return false;
  }
}


router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/login', function (req, res, next) {

  const username = req.body.uname;
  console.log(username);
  let loginResult = login(username, req.body.psw);

  if (loginResult) {
      res.render('users', {username: username});
  }
  else {
      res.render('index', {error: true});
  }
});
module.exports = router;