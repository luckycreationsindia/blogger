const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// =======
// Schemas
// =======

const PostSchema = new Schema({
        group: {type: mongoose.Types.ObjectId, index: true, required: true, ref: 'groups'},
        user: {type: mongoose.Types.ObjectId, index: true, required: true, ref: 'users'},
        category: {type: mongoose.Types.ObjectId, index: true, ref: 'categories'},
        labels: {type: [{type: String, trim: true, maxLength: 10}]},
        deleted_by: {type: mongoose.Types.ObjectId, ref: 'users'},
        parent: {type: mongoose.Types.ObjectId, index: true, ref: 'posts'},
        title: {type: String, trim: true, maxLength: 150},
        post: {type: String, required: true, trim: true},
        total_comments: {type: Number, default: 0},
        total_likes: {type: Number, default: 0},
        pinned: {type: Boolean, default: false},
        is_global: {type: Boolean, default: false},
        no_of_shares: {type: Number, default: 0},
        no_of_spam_reports: {type: Number, default: 0},
        status: {type: Boolean, default: true},
        images: {type: [{type: String, trim: true}]},
        deletedAt: {type: Schema.Types.Date},
    },
    {timestamps: true, collection: 'posts'}
);

PostSchema.pre('validate', function (next) {
    if (this.labels && this.labels.length > 10) {
        next(new Error('Labels cannot be more than 10'));
    } else if (this.images && this.images.length > 5) {
        next(new Error('Images cannot be more than 5'));
    } else {
        next();
    }
});
PostSchema.set('toObject', {virtuals: true});
PostSchema.set('toJSON', {virtuals: true});
PostSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
PostSchema.virtual('userdata', {
    ref: 'users',
    localField: 'user',
    foreignField: '_id',
    justOne: true
});

const models = {};
models.Post = mongoose.model('posts', PostSchema, 'posts');

module.exports = models;