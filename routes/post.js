const express = require('express');
const router = express.Router();
const controller = require('../controllers/post_manager');

router.post('/add', function (req, res) {
  controller.add(req.user, req.body, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

router.post('/update/:id?', function (req, res) {
  let data = req.body;
  data.id = req.body.id || req.params.id;
  controller.update(req.user, data, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

router.post('/updateStatus', function (req, res) {
  controller.updateStatus(req.user, req.body, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

router.post('/load', function (req, res) {
  controller.load(req.user, req.body, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

router.post('/count', function (req, res) {
  controller.getCount(req.user, req.body, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

router.delete('/delete/:id', function (req, res) {
  controller.remove(req.user, req.params.id, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

router.post('/d/:id', function (req, res) {
  controller.getDetailsForUser(req.user, req.params.id, function (err, result) {
    routeCBHandler(err, result, res);
  });
});

module.exports = router;