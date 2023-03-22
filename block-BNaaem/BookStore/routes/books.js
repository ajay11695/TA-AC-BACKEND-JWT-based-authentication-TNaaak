var express = require('express');
var multer=require('multer')
var fs=require('fs')
var auth=require('../middleware/auth')

var router = express.Router();
var Books=require('../model/Book')
var Author=require('../model/Author');
var Comment=require('../model/Comment');


// const upload = multer({ dest: "public/images" });
//Configuration for Multer
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
  
    cb(null, Date.now() + file.originalname);
  },
});

var upload=multer({storage:storage})

/* GET book listing. */
router.get('/',  (req, res, next)=> {
  
  Books.find({},(err,books)=>{
    Books.distinct('tags',(err,tags)=>{
    if(err)return next(err)
      res.render('bookstore',{ books,tags });
    })

  })
});

// create book form
router.get('/new',(req,res)=>{
  res.render('createBook')
})

// create book
router.post('/',upload.single('cover_image'),(req,res,next)=> {
  req.body.cover_image=req.file.filename.trim()
  req.body.categories=req.body.categories.trim().split(' ')
  Author.create(req.body,(err,author)=>{
    if(err)return next(err)
    req.body.authorId=author._id
        Books.create(req.body,(err,book)=>{
        if(err)return next(err)
        Author.findOneAndUpdate({authorName:book.authorName},{$push:{bookId:book._id}},{new:true},(err,author)=>{
          if(err)return next(err)
          console.log(book,author)
          res.redirect('/api/v1/books')
        })
      })
    })
})

// serach book
router.post('/search',(req,res,next)=>{
  console.log(req.body)
  Books.find({title:req.body.book},(err,books)=>{
    Books.distinct('tags',(err,tags)=>{
      if(err)return next(err)
        res.render('bookstore',{ books,tags });
      })
  })
})

// search book from category
router.post('/category',(req,res,next)=>{
  console.log(req.body)
  Books.find({categories:{$in:[req.body.category]}},(err,books)=>{
    Books.distinct('tags',(err,tags)=>{
      if(err)return next(err)
        res.render('bookstore',{ books,tags });
      })
  })
})

// search book from tags
router.post('/tags',(req,res,next)=>{
  console.log(req.body)
  Books.find({tags:req.body.tags},(err,books)=>{
    Books.distinct('tags',(err,tags)=>{
      if(err)return next(err)
        res.render('bookstore',{ books,tags });
      })
  })
})

// fetcing book
router.get('/:id',(req,res,next)=>{
  var id=req.params.id
  // Books.findById(id,(err,book)=>{
  //   Author.findById(book.authorId,(err,author)=>{

  //     console.log(author,book)
  //   })
  // })

  Books.findById(id).populate('authorId').populate('commentId').exec((err,book)=>{
    if(err)return next(err)
    res.render('bookDetail',{ book })
  })
})

// edit book
router.get('/:id/edit',(req,res,next)=>{
  var id =req.params.id
  Books.findById(id).populate('authorId').exec((err,book)=>{
    if(err)return next(err)
    book.categories=book.categories.join(' ')
    res.render('editbook',{ book })
  })
})

// update book
router.post('/:id',upload.single('cover_image'),(req,res,next)=>{
  var id =req.params.id 
  let file = req.file
  let prev_Image = req.body.cover_image

  let new_image = ''

  if(file){
    new_image = req.file.filename;
    try {
      
      //delete th old img
      fs.unlinkSync('./public/images/'+prev_Image)
    } catch (error) {
      console.log(error)
    }
  }else{
    new_image = prev_Image
  }
  req.body.cover_image = new_image
  req.body.categories=req.body.categories.trim().split(' ')

  Books.findByIdAndUpdate(id,req.body,(err,ubook)=>{
    if(err)return next(err)
    Author.findByIdAndUpdate(ubook.authorId,req.body,(err,author)=>{
      if(err) return next(err)
      res.redirect('/api/v1/books/'+ id)
    })
 
  })

})

// delete book
router.get('/:id/delete',(req,res,next)=>{
  var id =req.params.id
  Books.findByIdAndDelete(id,req.body,(err,deleteBook)=>{
    Author.findByIdAndDelete(deleteBook.authorId,(err,author)=>{
      if(deleteBook.cover_image !==''){
        try {
          fs.unlinkSync('./public/images/' + deleteBook.cover_image)
        } catch (error) {
          console.log(error)
        }
      }else{
        res.redirect('/books')
      }
      if(err)return next(err)
      res.redirect('/api/v1/books')
    })
  })
})

// add comment
router.post('/:id/comment',(req,res,next)=>{
  var id=req.params.id
  req.body.bookId=id
  console.log(req.body)
  Comment.create(req.body,(err,Comment)=>{
    Books.findByIdAndUpdate(id,{$push:{commentId:Comment._id}},(err,book)=>{
      if(err) return next(err)
      res.redirect('/api/v1/books/' + id)
    })
  })
})

module.exports = router;

