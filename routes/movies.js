const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');

let movieData = require("../movie-data-short.json");
