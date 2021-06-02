const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// =======
// Schemas
// =======

const SettingSchema = new Schema({
        parent: {type: mongoose.Types.ObjectId, index: true, ref: 'settings'},
        name: {type: Schema.Types.Mixed, required: true, index: true, unique: true, maxLength: 100},
        value: {type: Schema.Types.Mixed, maxLength: 100},
        description: {type: String, trim: true},
        status: {type: Boolean, default: true},
    },
    {timestamps: true, collection: 'settings'}
);

SettingSchema.set('toObject', {virtuals: true});
SettingSchema.set('toJSON', {virtuals: true});
SettingSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const models = {};
models.Setting = mongoose.model('settings', SettingSchema, 'settings');

module.exports = models;