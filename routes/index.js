  const express = require('express');
const router = express.Router();
//const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', (req, res) => res.render('welcome'));

// Dashboard
router.get('/userProfile', (req, res) =>
  res.render('userProfile', {
    user: req.user
  })
);

module.exports = router;
