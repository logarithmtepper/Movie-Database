const express = require('express');
const router = express.Router();
//const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/login', function(req, res, next) {
  res.render('login', { error: false });
});

module.exports = router;