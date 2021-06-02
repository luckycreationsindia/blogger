const Model = require('../models/category');

let add = (user, data, cb) => {
    if (!permissionCheck(user, 'categorymanager')) {
        return cb('Unauthorized Access');
    }
    let newCategory = new Model.Category(data);
    newCategory.save((err, data) => {
        if (err) return cb(dbErrorHandler(err));
        cb(null, data);
    });
};

let update = (user, data, cb) => {
    if (!permissionCheck(user, 'categorymanager')) {
        return cb('Unauthorized Access');
    }
    let newData = {name: data.name, description: data.description};
    Model.Category.findByIdAndUpdate(data.id, newData, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        getDetails(data.id, (err, data) => {
            if (err) return cb(dbErrorHandler(err));
            cb(null, data);
        });
    });
};

let load = function (user, data, cb) {
    let filters = [];
    let allFilters = {};
    let mainFilters = data.filters || {};
    if(user.role !== 1) mainFilters.status = true;
    if (data.search) {
        let s = {$regex: (data.search), $options: "i"};
        filters.push({name: s});
        filters.push({description: s});
        allFilters['$or'] = filters;
    }
    if (Object.keys(mainFilters).length) {
        allFilters['$and'] = [mainFilters];
    }
    let sort = data.reverse ? {_id: -1} : {};
    Model.Category.find(allFilters).sort(sort).exec((err, data) => {
        if (err) return cb(dbErrorHandler(err));
        cb(null, data);
    });
};

let getCount = function (user, data, cb) {
    Model.Category.countDocuments({status: true}, function (err, row) {
        if (err) return cb(dbErrorHandler(err));
        try {
            if (row) {
                cb(null, row);
            } else {
                cb('No Data Found');
            }
        } catch (err) {
            return cb(dbErrorHandler(err));
        }
    });
};

let getDetails = function (id, cb) {
    Model.Category.findById(id, function (err, row) {
        if (err) return cb(dbErrorHandler(err));
        try {
            if (row) {
                cb(null, row);
            } else {
                cb('No Data Found');
            }
        } catch (err) {
            return cb(dbErrorHandler(err));
        }
    });
};

let updateStatus = function (user, data, cb) {
    if (!permissionCheck(user, 'categorymanager')) {
        return cb('Unauthorized Access');
    }
    let newData = {status: data.status};
    Model.Category.findByIdAndUpdate(data.id, newData, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        cb(null, 'Success');
    });
};

let remove = function (user, id, cb) {
    if (!permissionCheck(user, 'categorymanager')) {
        return cb('Unauthorized Access');
    }
    Model.Category.deleteOne({"_id": id}, {}, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        cb(null, 'Success');
    });
};

module.exports = {
    add,
    update,
    load,
    getDetails,
    getCount,
    updateStatus,
    remove,
};