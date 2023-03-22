var mongoose=require('mongoose')
var Schema=mongoose.Schema

var commentSchema=new Schema({
    name:String,
    comment:String,
    bookId:{type:Schema.Types.ObjectId,ref:'Book'}
},{
    timestamps:true
})

module.exports=mongoose.model('Comment',commentSchema)