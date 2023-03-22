var mongoose=require('mongoose')
var Schema=mongoose.Schema

var bookSchema= new Schema({
    title:{type:String,required:true},
    summary:{type:String},
    pages:Number,
    publication:String,
    categories:[String],
    tags:String,
    price:Number,
    quantity:Number,
    cover_image:String,
    authorName:String,
    authorId:{type:Schema.Types.ObjectId,ref:'Author'},
    userId:{type:Schema.Types.ObjectId,ref:'User'},
    commentId:[{type:Schema.Types.ObjectId,ref:'Comment'}]
},{
    timestamps:true
})

module.exports=mongoose.model('Book',bookSchema)