const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// =======
// Schemas
// =======

const GroupSchema = new Schema({
        parent: {type: mongoose.Types.ObjectId, index: true, ref: 'groups'},
        name: {type: String, required: true, trim: true, maxLength: 200},
        subCount: {type: Number, default: 0},
        description: {type: String, trim: true, maxLength: 1000},
        status: {type: Boolean, default: false},
        images: [{type: String, trim: true}],
    },
    {timestamps: true, collection: 'groups'}
);

GroupSchema.set('toObject', {virtuals: true});
GroupSchema.set('toJSON', {virtuals: true});
GroupSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const models = {};
models.Group = mongoose.model('groups', GroupSchema, 'groups');

module.exports = models;