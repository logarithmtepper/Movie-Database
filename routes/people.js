const express = require('express');
const router = express.Router();
const Person = require("../personModel");

router.get("/", queryParser);
router.get("/", loadPeople);
router.get("/", respondPeople);

router.get("/:id", getPerson);
router.get("/:id", sendPerson);

//function loadPeople(req, res, next){
//}

//function respondPeople(req, res, next){
//}

module.exports = router;
