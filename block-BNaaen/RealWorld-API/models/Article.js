let mongoose = require('mongoose')
let Schema = mongoose.Schema
let slug = require('slug')

let articleSchema = new Schema({
    slug: String,
    title: { type: String, required: true },
    description: { type: String, required: true },
    body: { type: String, required: true },
    tagList: [String],
    favorite: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    favorited: { type: Boolean, default: false },
    favoritesCount: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    commentId: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true })


articleSchema.pre('save', function (next) {
    this.slug = slug(this.title, '-')
    next()
})

module.exports = mongoose.model('Article', articleSchema)