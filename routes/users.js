const express = require('express');
const router = express.Router();
const userManager = require('../controllers/user_manager');

router.get('/', function (req, res) {
  res.json({ status: 'Error', message: 'Not Found' });
});

//http://localhost:port/users/addUser
router.post('/addUser', function (req, res) {
  userManager.addUser(req.user, req.body, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

//http://localhost:port/users/updateUser
router.post('/updateUser', function (req, res) {
  userManager.updateUser(req.user, req.body, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

//http://localhost:port/users/updateUserPassword
router.post('/updateUserPassword', function (req, res) {
  userManager.updateUserPassword(req.user, req.body, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

//http://localhost:port/users/getAllUsers
router.get('/getAllUsers', function (req, res) {
  userManager.getAllUsers(req.user, req.query, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

//http://localhost:port/users/getAllUsersForSelection
router.get('/getAllUsersForSelection', function (req, res) {
  userManager.getAllUsersForSelection(req.user, req.query, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

//http://localhost:port/users/changePassword
router.post('/changePassword', function (req, res) {
  userManager.changePassword(req.user, req.body, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

module.exports = router;