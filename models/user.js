const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// =======
// Schemas
// =======

const UserSchema = new Schema({
        email: {type: String, required: true, index: true, unique: true, maxlength: 100, trim: true},
        password: {type: String, required: true, maxlength: 200, trim: true},
        first_name: {type: String, required: true, maxlength: 50, trim: true},
        last_name: {type: String, maxlength: 50, trim: true},
        role: {type: Number, maxlength: 1},
        permissions: [{type: Number}],
        status: {type: Boolean, default: false}
    },
    {timestamps: true, collection: 'users'}
);

UserSchema.set('toObject', {virtuals: true});
UserSchema.set('toJSON', {virtuals: true});
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const models = {};
models.User = mongoose.model('users', UserSchema, 'users');

module.exports = models;