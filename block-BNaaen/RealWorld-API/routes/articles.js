var express = require('express');
var router = express.Router();
var auth=require('../middleware/auth');
var User=require('../models/User')
var Article=require('../models/Article')
var Comment=require('../models/Comment')
let slug = require('slug')

/* GET home page. */
router.get('/',async function(req, res, next) {
    var { taglist, author, favorited, limit, offset } = req.query
    try {
        if (taglist) {
            let articles = await Article.find({ taglist: taglist })
            return res.json({ articles, articlesCount: articles.length })
        }
        if (author) {
            var user=await User.find({username:author})
            let articles = await Article.find({ author: user._id })
            return res.json({ articles, articlesCount: articles.length })
        }
        if (favorited) {
            var user=await User.find({username:favorited})
            let articles = await Article.find({ author: user._id })
            return res.json({ articles, articlesCount: articles.length })
        }
        if (limit) {
            let articles = await Article.find({}).limit(limit)
            return res.json({ articles, articlesCount: articles.length })
        }
        if (offset) {
            let articles = await Article.find({}).skip(offset)
            return res.json({ articles, articlesCount: articles.length })
        }
        let articles = await Article.find({})
        return res.json({ articles, articlesCount: articles.length })
    } catch (error) {
        next(error)
    }
});

router.use(auth.varifyToken)


//feed article 
router.get('/feed', async (req, res, next) => {
    let { limit, offset } = req.query
    if (limit) {
        let articles = await Article.find({}).limit(limit)
        return res.json({ articles, articlesCount: articles.length })
    }

    if (offset) {
        let articles = await Article.find({}).skip(offset)
        return res.json({ articles, articlesCount: articles.length })
    }
})

// get article
router.get('/:slug',async (req,res,next)=>{
    var slug=req.params.slug
    let articles = await Article.findOne({slug}).populate('author','username bio image follow')
    return res.json({ articles, articlesCount: articles.length })
})

//crate article
router.post('/', async (req, res, next) => {
    let loggedInUser = req.user.userId

    try {
        req.body.author = req.user.userId
        req.body.tagList = req.body.tagList.split(',')
        var data=await Article.create(req.body)
        let article =await data .populate('author', 'username bio image follower follow')
        if (article.author.follower.includes(loggedInUser)) {
            article.author.follow = true
            let user = await User.findByIdAndUpdate(req.user.userId, { $push: { article: article._id } }, { new: true })
            return res.json({ article })
        }
        let user = await User.findByIdAndUpdate(req.user.userId, { $push: { article: article._id } }, { new: true })
        return res.json({ article })
    } catch (error) {
        next(error)
    }
})

// update article
router.put('/:slug',async (req,res,next)=>{

    if(req.body.title){
        req.body.slug=slug(req.body.title,'-')
    }
    let article = await Article.findOneAndUpdate(req.params.slug, req.body, { new: true })
    res.json({ article })
})

//delete article
router.delete('/:slug', async (req, res, next) => {
    let slug = req.params.slug
    let article = await Article.findOneAndDelete({ slug: slug })
    let user = await User.findByIdAndUpdate(req.users.userId, { $pull: { article: article._id } }, { new: true })
    let comment = await Comment.deleteMany({ articleId: article._id })
    res.json({ article })
})

//add comment in article
router.post('/:slug/comments', async (req, res, next) => {
    let slug = req.params.slug
    let article = await Article.findOne({ slug: slug })
    req.body.author=req.user.userId
    req.body.articleId=article._id
    var comment=await Comment.create(req.body)
    let uArticle = await Article.findOneAndUpdate({ slug: slug }, { $push: { commentId: comment._id } })
    
    res.json({ comment })
})

//get comment
router.get('/:slug/comments', async (req, res, next) => {
    let slug = req.params.slug
    let article = await Article.findOne({ slug: slug })
    let comment = await Comment.find({ articleId: article._id })
    res.json({ comment })
})

//delete comment
router.delete('/:slug/comments/:id', async (req, res, next) => {
    let id = req.params.id
    let comment = await Comment.findByIdAndDelete(id)
    let slug = req.params.slug
    let article = await Article.findOneAndUpdate({ slug: slug }, { $pull: { commentId: comment._id } })
    res.json(comment)
})

// favorite
router.post('/:slug/favorite', async (req, res, next) => {
    let slug = req.params.slug
    let loggedInUser = req.user.userId
    let ar = await Article.findOne({ slug: slug })

    //checking if already favorite then remove 
    if (ar.favorite.includes(loggedInUser)) {
        let article = await Article.findOneAndUpdate({ slug: slug }, { $pull: { favorite: loggedInUser } }, { new: true })
        article.favorited = false
        article.favoritesCount = article.favorite.length
        let user = await User.findByIdAndUpdate(article.author, { $pull: { favorite: article._id } },{ new: true })
         await article.save()
        res.json({article,user})
    } else {
        // if not present then add to favorite
        let article = await Article.findOneAndUpdate({ slug: slug }, { $push: { favorite: loggedInUser } }, { new: true })
        article.favorited = true
        article.favoritesCount = article.favorite.length
        let user = await User.findByIdAndUpdate(article.author, { $push: { favorite: article._id } },{ new: true })
        await article.save()

        res.json({article,user})
    }
})

//unfavorite
router.delete('/:slug/favorite', async (req, res, next) => {
    let slug = req.params.slug
    let loggedInUser = req.user.userId
    let article = await Article.findOneAndUpdate({ slug: slug }, { $pull: { favorite: loggedInUser } }, { new: true })
    article.favorited = false
    article.favoritesCount = article.favorite.length
    let user = await User.findByIdAndUpdate(article.author, { $pull: { favorite: article._id } })
    article.save()
    res.json(article)
})



module.exports = router;