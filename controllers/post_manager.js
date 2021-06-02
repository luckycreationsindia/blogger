const Model = require('../models/post');

let add = (user, data, cb) => {
    if (!data.group) return cb('Invalid Group');
    if (!data.post) return cb('Post Cannot be Empty');
    if (user.role !== 1) data.user = user.id;
    if (!data.user) data.user = user.id;
    let newPost = new Model.Post(data);
    newPost.save((err, data) => {
        if (err) return cb(dbErrorHandler(err));
        getDetails(data.id, (err, data) => {
            if (err) return cb(dbErrorHandler(err));
            cb(null, data);
        });
    });
};

let update = (user, data, cb) => {
    if (!data.id) return cb('Invalid Post');
    if (!data.post) return cb('Post Cannot be Empty');
    let newData = {post: data.post};
    if(data.group) newData.group = data.group;
    if(data.title) newData.title = data.title;
    if(data.images) newData.images = data.images;
    let filter = {_id: data.id};
    if (user.role !== 1) filter.user = user.id;
    Model.Post.findOneAndUpdate(filter, newData, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        getDetails(data.id, (err, data) => {
            if (err) return cb(dbErrorHandler(err));
            cb(null, data);
        });
    });
};

let updateLikeCount = (id) => {
    // LikeModel.Like.countDocuments({postId: id}, async (err, count) => {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }
    //     let newData = {total_likes: count};
    //     await Model.Post.findByIdAndUpdate(id, newData, (err1, doc) => {});
    // });
};

let updateCommentCount = (id) => {
    // CommentModel.Comment.countDocuments({postId: id}, async (err, count) => {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }
    //     let newData = {total_comments: count};
    //     await Model.Post.findByIdAndUpdate(id, newData, (err1, doc) => {});
    // });
};

let load = function (user, data, cb) {
    //if (!data.groupId) return cb('Invalid Group');
    let filters = [];
    let allFilters = {};
    let mainFilters = data.filters || {};
    // if (user.role !== 1) mainFilters.user = user.id;
    if (data.group) mainFilters.group = data.group;
    if (user.role !== 1) mainFilters.status = true;
    if (data.search) {
        let s = {$regex: (data.search), $options: "i"};
        filters.push({title: s});
        filters.push({post: s});
        allFilters['$or'] = filters;
    }
    if (Object.keys(mainFilters).length) {
        allFilters['$and'] = [mainFilters];
    }
    let sort = data.reverse ? {_id: -1} : {};
    let page = data.page ? data.page - 1 : 0;
    let limit = defaultConfig.loadLimit;
    Model.Post.find(allFilters)
        .populate('userdata', {'first_name': 1, 'last_name': 1, 'role': 1, 'image': 1})
        .sort(sort).limit(limit).skip(limit * page).exec(async (err, data) => {
        await getLiked(data);
        if (err) return cb(dbErrorHandler(err));
        cb(null, data);
    });
};

let getLiked = async function (data) {
    // for (let i = 0; i < data.length; i++) {
    //     let count = (await LikeModel.Like.countDocuments({userId: data[i].user, postId: data[i].id}));
    //     data[i].liked = count > 0;
    // }
}

let getDetailsForUser = function (user, id, cb) {
    if (!id) return cb('Invalid Post');
    let filter = {_id: id};
    if (user.role !== 1) filter.user = user.id;
    Model.Post.findOne(filter)
        .populate('userdata', {'first_name': 1, 'last_name': 1, 'role': 1, 'image': 1})
        .exec(function (err, row) {
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

let getCount = function (user, data, cb) {
    if (!data.group) return cb('Invalid Group');
    let filter = {group: data.group, status: true};
    if (user.role !== 1) filter.user = user.id;
    Model.Post.countDocuments(filter, function (err, row) {
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
    Model.Post.findById(id)
        .populate('userdata', {'first_name': 1, 'last_name': 1, 'role': 1, 'image': 1})
        .exec(function (err, row) {
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

let remove = (user, id, cb) => {
    if (!id) return cb('Invalid Id');
    let newData = {status: false};
    newData.deleted_by = user.id;
    newData.deletedAt = new Date();
    Model.Post.findOneAndUpdate({_id: id, user: user.id}, newData, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        cb(null, 'Success');
    });
};

let updateStatus = function (user, data, cb) {
    if (!permissionCheck(user, 'postmanager')) {
        return cb('Unauthorized Access');
    }
    let newData = {status: data.status};
    Model.Post.findByIdAndUpdate(data.id, newData, (err, data) => {
        if (err) return cb(dbErrorHandler(err));
        cb(null, 'Success');
    });
};

module.exports = {
    add,
    update,
    updateLikeCount,
    updateCommentCount,
    load,
    getDetails,
    getDetailsForUser,
    getCount,
    remove,
    updateStatus
};