var express=require('express')
var router = express.Router();
var Books=require('../model/Book')
var Author=require('../model/Author');
var Comment=require('../model/Comment');

// edit comment
router.get('/:id/edit', (req, res, next) => {
    var id = req.params.id
    Comment.findById(id,(err, comment) => {
        if (err) return next(err)
        res.render('editComment', { comment })
    })
  })
  
  // update comment
  router.post('/:id', (req, res, next) => {
    console.log(req.body)
    Comment.findByIdAndUpdate(req.params.id, req.body, (err, updateComment) => {
      if (err) return next(err)
      res.redirect('/api/v1/books/' + updateComment.bookId)
    })
  })
  
  // delete comment
  router.get('/:id/delete', (req, res, next) => {
    var id = req.params.id
        Comment.findByIdAndDelete(id, (err, deleteComment) => {
          Books.findByIdAndUpdate(deleteComment.bookId, { $pull: { commentId: deleteComment._id } }, (err, book) => {
            if (err) return next(err)
            res.redirect('/api/v1/books/' + book._id)
          })
        })
    })
  


module.exports = router;
