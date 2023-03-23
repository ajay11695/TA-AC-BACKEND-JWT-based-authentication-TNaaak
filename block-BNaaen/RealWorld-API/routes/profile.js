var express = require('express');
var router = express.Router();
var auth=require('../middleware/auth');
const { findByIdAndUpdate } = require('../models/User');
var User=require('../models/User')

/* GET profile. */
router.get('/:username',auth.userInfo,async function(req, res, next) {
  try {
    var username=req.params.username
    var profile=await User.findOne({username},'username bio image follow follower')
    if(req.user){
        var loguser=await User.findById(req.user.userId)
        console.log(loguser,profile)
        if(profile.follower.includes(loguser._id)){
            profile.follow=true
            res.json({profile})
        }else{
            res.json({profile}) 
        }
    }else{
        res.json({profile})
    }
  } catch (error) {
    next(error)
  }
});

router.use(auth.varifyToken)

// follow user
router.post('/:username/follow',async (req,res,next)=>{
    var username=req.params.username
    var loggeduser=req.user.userId
    try {
        var followuser=await User.findOne({username})
        if(!followuser){
           return res.json({error:`${username} is not found`})
        }

        if(followuser._id.equals(loggeduser)){
           return res.json({error:'You Can`t follow Yourself'})
        }

        if(followuser.follower.includes(loggeduser)){
           return res.json({error:'You have already follow '})
        }

        var user=await User.findOneAndUpdate({username},{$push:{follower:loggeduser}},{new:true})
        user.follow=true
        var profile={
            username:username,
            bio:user.bio,
            image:user.image,
            follow:user.follow
        }

        res.json({profile,user})

    } catch (error) {
        next(error)
    }
})


// unfollow user
router.delete('/:username/follow',async (req,res,next)=>{
    var username=req.params.username
    var loggeduser=req.user.userId
    try {
        var unfollowuser=await User.findOne({username})
        if(!unfollowuser){
           return res.json({error:`${username} is not found`})
        }

        if(unfollowuser._id.equals(loggeduser)){
           return res.json({error:'You Can`t unfollow Yourself'})
        }

        if(unfollowuser.follower.includes(loggeduser)){
            var user=await User.findOneAndUpdate({username},{$pull:{follower:loggeduser}},{new:true})
        user.follow=false
        var profile={
            username:username,
            email:user.email,
            bio:user.bio,
            image:user.image,
            follow:user.follow
        }

        return res.json({profile,user})
        }

        return res.json({error:'You have already unfollow '})

    } catch (error) {
        next(error)
    }
})

module.exports = router;
