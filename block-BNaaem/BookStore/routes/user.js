

var express = require('express');
var router = express.Router();
var User = require('../model/User')
var jwt = require('jsonwebtoken')
var auth=require('../middleware/auth')

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});


// register user
router.get('/register', function (req, res, next) {
    // console.log(req.flash('error'))
    // var error=req.flash('error')[0]
    res.render('register');
});

router.post('/register', async (req, res, next) => {
    try {
        var user = await User.create(req.body)
       res.redirect('/api/user/login')
    } catch (error) {
        res.redirect('/api/user/register')
    }
})

// login user
router.get('/login', function (req, res, next) {
    res.render('login');
});

router.post('/login', async (req, res, next) => {
    var { email, password } = req.body
    if (!email || !password) {
        res.status(400).json({ error: "Email/Password required" })
    }
    try {
        var user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({ error: "Email is not registered" })
        }
        var result = await user.verifyPassword(password)
        if (!result) {
            res.status(400).json({ error: "password inCorrect" })
        }
        // generate token
        var token = await user.signToken()
        res.json({ user: user.userJson(token) })

    } catch (error) {
        next(error)
    }
})

router.post('/:id/books/new',auth.verifyToken,async function (req, res, next) {
    let id = req.params.id
    req.body.userId = id
    req.body.categories=req.body.categories.trim().split(' ')
    try {
        let book = await Book.create(req.body)
        let user = await User.findByIdAndUpdate(id, { $push: { bookId: book.id } })
        res.json({msg:'book successfully addded',user:user})
    } catch (error) {
        return next(error)
    }
})

//added to cartt
router.put('/:id/cart', async (req, res, next) => {
    let id = req.params.id
    try {
      let book = await Book.findById(id)
      let user = await User.findByIdAndUpdate(book.userId, { $push: { cart: book._id } })
      res.json({ message: 'book added to cart successfully', user })
    } catch (error) {
      next(error)
    }
  })
  
  router.put('/:id/deleteCart', async (req, res) => {
    let id = req.params.id
    try {
      let book = await Book.findById(id)
      let user = await User.findByIdAndUpdate(book.userId, { $pull: { cart: book._id } })
      res.json({ message: 'book removed from cart successfully', user })
    } catch (error) {
      next(error)
    }
  })

module.exports = router;