const Model = require('../models/group');

let add = (user, data, cb) => {
    if (!permissionCheck(user, 'groupmanager')) {
        return cb('Unauthorized Access');
    }
    let newData = new Model.Group(data);
    newData.save(async (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        data.subCount = (await Model.Group.countDocuments({parent: data.id}));
        Model.Group.findByIdAndUpdate(data.id, {"subCount": data.subCount}, (err, data) => {
        });
        cb(null, data);
    });
};

let update = async (user, data, cb) => {
    if (!permissionCheck(user, 'groupmanager')) {
        return cb('Unauthorized Access');
    }
    let newData = {group: data.group};
    newData.subCount = (await Model.Group.countDocuments({parent: data.id}));
    Model.Group.findByIdAndUpdate(data.id, newData, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        getDetails(data.id, async (err, data) => {
            if (err) return cb(dbErrorHandler(err));
            cb(null, data);
        });
    });
};

let load = function (user, data, cb) {
    let filters = [];
    let allFilters = {};
    let mainFilters = data.filters || {};
    if (user.role !== 1) mainFilters.status = true;
    if (data.search) {
        let s = {$regex: (data.search), $options: "i"};
        filters.push({group: s});
        allFilters['$or'] = filters;
    }
    if (Object.keys(mainFilters).length) {
        allFilters['$and'] = [mainFilters];
    }
    let sort = data.reverse ? {_id: -1} : {};
    let page = data.page ? data.page - 1 : 0;
    let limit = defaultConfig.loadLimit;
    Model.Group.find(allFilters).sort(sort).limit(limit).skip(limit * page).exec(async (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        await getSubCount(data);
        cb(null, data);
    });
};

let loadById = function (user, data, cb) {
    if (!data.id) return cb('Invalid Group');
    Model.Group.find({"_id": data.id, "status": true}, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        if (!data.length) return cb('Invalid Group');
        cb(null, data[0]);
    });
};

let getCount = function (user, data, cb) {
    Model.Group.countDocuments({status: true}, function (err, row) {
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

let getSubCount = async function (data) {
    for (let i = 0; i < data.length; i++) {
        data[i].subCount = (await Model.Group.countDocuments({parent: data[i].id, status: true}));
    }
};

let getDetails = function (id, cb) {
    Model.Group.findById(id, function (err, row) {
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
    if (!permissionCheck(user, 'groupmanager')) {
        return cb('Unauthorized Access');
    }
    let newData = {status: data.status};
    Model.Group.findByIdAndUpdate(data.id, newData, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        cb(null, 'Success');
    });
};

let remove = function (user, id, cb) {
    if (!permissionCheck(user, 'groupmanager')) {
        return cb('Unauthorized Access');
    }
    Model.Group.deleteOne({"_id": id}, {}, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        cb(null, 'Success');
    });
};

module.exports = {
    add,
    update,
    load,
    loadById,
    getDetails,
    getCount,
    updateStatus,
    remove,
};