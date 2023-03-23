var express = require('express');
var router = express.Router();
var User = require('../models/User')
var auth=require('../middleware/auth')

/* GET users listing. */


// register
router.post('/', async (req, res, next) => {
  try {
    var user = await User.create(req.body)
    res.json({ user })
  } catch (error) {
    next(error)
  }
})

//login
router.post('/login', async (req, res, next) => {
  let { email, password } = req.body
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email/password is required' })
    }
    let user = await User.findOne({ email })

    //no email
    if (!user) {
      return res.status(400).json({ error: 'Invalid Email' })
    }

    let result = await user.varifyPassword(password)

    //no password
    if (!result) {
      return res.status(400).json({ error: 'Wrong Password' })
    }

    //generate token
    let token = await user.signToken()
    res.json({ user: user.userJSON(token) })

  } catch (error) {
    next(error)
  }
})

router.use(auth.varifyToken)

// get current user
router.get('/', async function (req, res, next) {
  try {
    var user=await User.findById(req.user.userId)
    res.json({ user })
  } catch (error) {
    next(error)
  }
});

// update user
router.put('/', async function (req, res, next) {
  console.log(req.body)
  try {
    var user=await User.findByIdAndUpdate(req.user.userId,req.body,{new:true})
    res.json({ user })
  } catch (error) {
    next(error)
  }
});

module.exports = router;
