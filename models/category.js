const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// =======
// Schemas
// =======

const CategorySchema = new Schema({
        parent: {type: mongoose.Types.ObjectId, index: true, ref: 'categories'},
        name: {type: String, required: true, trim: true, maxLength: 200},
        description: {type: String, trim: true, maxLength: 1000},
        status: {type: Boolean, default: false},
        images: [{type: String, trim: true}],
    },
    {timestamps: true, collection: 'categories'}
);

CategorySchema.set('toObject', {virtuals: true});
CategorySchema.set('toJSON', {virtuals: true});
CategorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const models = {};
models.Category = mongoose.model('categories', CategorySchema, 'categories');

module.exports = models;