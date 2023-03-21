var express = require('express');
var router = express.Router();
var User=require('../model/User')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// register user
router.post('/register',async(req,res,next)=>{
  try {
    var user=await User.create(req.body)
    console.log(user)
    res.status(201).json({user})
  } catch (error) {
    next(error)
  }
})


// login user
router.post('/login',async(req,res,next)=>{
  var {email ,password}=req.body
  if(!email || !password){
    res.status(400).json({error:"Email/Password required"})
  }
  try {
    var user=await User.findOne({email})
    if(!user){
      res.status(400).json({error:"Email is not registered"})
    }
    var result=await user.verifyPassword(password)
    if(!result){
      res.status(400).json({error:"password inCorrect"})
    }

    console.log(user,result)
    
  } catch (error) {
    next(error)
  }
})

module.exports = router;
