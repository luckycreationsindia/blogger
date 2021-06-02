const userModel = require('../models/user');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

let addUser = (user, data, cb, force) => {
	if (!force && !permissionCheck(user, 'usermanager')) {
		return cb('Unauthorized Access');
	}
	data.password = bcrypt.hashSync(data.password, saltRounds);
	let newUser = new userModel.User(data);
	newUser.save((err, data) => {
		if (err) return cb(dbErrorHandler(err));
		cb(null, 'Success');
	});
};

let updateUser = (user, data, cb) => {
	if (!permissionCheck(user, 'usermanager')) {
		return cb('Unauthorized Access');
	}
	//let updateUser = new userModel.User(data);
	userModel.User.findByIdAndUpdate(data.id, data,(err, data) => {
		if (err) return cb(dbErrorHandler(err));
		cb(null, 'Success');
	});
	// updateUser.save((err, data) => {
	// 	if (err) return cb(dbErrorHandler(err));
	// 	cb(null, 'Success');
	// });
};

let updateUserPassword = function (user, data, cb) {
	if (!permissionCheck(user, 'usermanager')) {
		return cb('Unauthorized Access');
	}

	if (!data.password) return cb('Password cannot be empty');

	let hash = bcrypt.hashSync(data.password, saltRounds);

	let newData = {_id: data.id, password: hash};
	//let updateUser = new userModel.User(newData);
	userModel.User.findByIdAndUpdate(data.id, newData,(err, data) => {
		if (err) return cb(dbErrorHandler(err));
		cb(null, 'Success');
	});
	// updateUser.save((err, data) => {
	// 	if (err) return cb(dbErrorHandler(err));
	// 	cb(null, 'Success');
	// });
};

let getAllUsers = function (user, data, cb) {
	if (!permissionCheck(user, 'usermanager')) {
		return cb('Unauthorized Access');
	}
	userModel.User.find().select(['-tfa', '-password']).exec((err, data) => {
		if (err) return cb(dbErrorHandler(err));
		cb(null, data);
	});
};

let getUserDetails = function (uid, cb) {
	userModel.User.find({"_id": uid},function (err, rows) {
		if (err) return cb(dbErrorHandler(err));
		try {
			if (rows.length > 0) {
				cb(null, rows[0]);
			} else {
				cb('No Data Found');
			}
		} catch (err) {
			return cb(dbErrorHandler(err));
		}
	});
};

let getAllUsersForSelection = function (user, data, cb) {
	let filter = {"_id": 1, "login_id": 1, "email": 1, "first_name": 1, "last_name": 1};
	userModel.User.find({"status": true}).select(filter).exec((err, data) => {
		if (err) return cb(dbErrorHandler(err));
		cb(null, data);
	});
};

let changePassword = function (user, data, cb) {
	if (!data.password) return cb('Password cannot be empty');

	let hash = bcrypt.hashSync(data.password, saltRounds);

	let newData = {_id: user.id, password: hash};
	//let updateUser = new userModel.User(newData);
	userModel.User.findByIdAndUpdate(user.id, newData,(err, data) => {
		if (err) return cb(dbErrorHandler(err));
		cb(null, 'Success');
	});
	// updateUser.save((err, data) => {
	// 	if (err) return cb(dbErrorHandler(err));
	// 	cb(null, 'Success');
	// });
};

module.exports = {
	addUser,
	updateUser,
	updateUserPassword,
	getAllUsersForSelection,
	changePassword,
	getAllUsers,
	getUserDetails
};