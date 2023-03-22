var mongoose=require('mongoose')
var Schema=mongoose.Schema
var bcrypt=require('bcrypt')
var jwt=require('jsonwebtoken')

var userSchema=new Schema({
    name:{type:String,require:true},
    email:{type:String,require:true},
    password:{type:String,require:true}
},{
    timestamps:true
})

userSchema.pre('save',async function(next){
    if(this.password && this.isModified('password')){
        this.password=await bcrypt.hash(this.password,10)
    }
    next()
})

userSchema.methods.verifyPassword=async function(password){
    try {
        var result=await bcrypt.compare(password,this.password)
        return result
    } catch (error) {
        return error
    }
}

userSchema.methods.signToken=async function(){
    var payload={userId:this._id,email:this.email}
    try {
        var token =await jwt.sign(payload,'thisisasecret')
        return token
    } catch (error) {
        return error
    }
}

userSchema.methods.userJson=function(token){
    return {
        name:this.name,
        email:this.email,
        token:token
    }
}

module.exports=mongoose.model("User",userSchema)

