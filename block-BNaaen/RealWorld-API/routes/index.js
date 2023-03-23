var express = require('express');
var router = express.Router();
var Article=require('../models/Article')

/* GET home page. */
router.get('/tags',  async function(req, res, next) {
  var tag=await Article.distinct('tagList')
  res.json(tag)
});

module.exports = router;
