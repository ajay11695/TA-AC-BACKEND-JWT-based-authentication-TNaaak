let mongoose = require('mongoose')
let Schema = mongoose.Schema

let commetSchema = new Schema({
    body: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' }
}, { timestamps: true })

module.exports = mongoose.model('Comment', commetSchema)