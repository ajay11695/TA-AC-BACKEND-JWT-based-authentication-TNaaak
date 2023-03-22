var express = require('express');
var router = express.Router();
var auth=require('../middleware/auth')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// protected
router.get('/protect',auth.verifyToken,async (req,res,next)=>{
  console.log(req.user)
  try {
    res.status(200).json({access:'protected access'})
  } catch (error) {
    next(error)
  }
})

module.exports = router;
