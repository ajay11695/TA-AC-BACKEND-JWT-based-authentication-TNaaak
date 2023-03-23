let mongoose = require('mongoose')
let Schema = mongoose.Schema
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')

let userSchema = new Schema({
    username: { type: String, unique: true, required: true },
    bio: String,
    image: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    article: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    favorite: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    follow:{type:Boolean,default:false},
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    follower: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true })


userSchema.pre('save', async function (next) {
    if (this.password && this.isModified('password')) {
        let hashed = await bcrypt.hash(this.password, 10)
        this.password = hashed
        return next()
    }
    next()
})

userSchema.methods.varifyPassword = async function (password) {
    try {
        let result = await bcrypt.compare(password, this.password)
        return result
    } catch (error) {
        console.log(error);
    }
}


userSchema.methods.signToken = async function () {
    let payload = {
        userId: this._id,
        email: this.email
    }
    try {
        let token = jwt.sign(payload,'thisisasecret')
        return token
    } catch (error) {
        console.log(error);
    }

}

userSchema.methods.userJSON = function (token) {
    return {
        username: this.username,
        email: this.email,
        bio: this.bio,
        image: this.image,
        token: token
    }
}
module.exports = mongoose.model('User', userSchema)