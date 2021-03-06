var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const User = require('../models/user');

mongoose.connect('mongodb://localhost/tobiapp');
const db = mongoose.connection;

router.post('/signup', function (req, res, next) {

  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'Email has been taken'
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: 'User created'
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post('/signin', function (req, res, next) {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      const resp = {
        message: 'Auth Successfull',
        user: user
      };
      bcrypt.compare(req.body.password, user[0].password, function (err, result) {
        if (err) {
          return res.status(401).json({
            message: 'Auth failed'
          });
        }
        if (result) {
          return res.status(200).json(resp);
        }
        return res.status(401).json({
            message: 'Auth failed'
          });
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
})

router.delete('/:userId', function (req, res, next) {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: 'User deleted'
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find()
  .exec()
  .then( docs => {
    const response = {
      count: docs.length,
      units: docs
    };
    res.status(200).json(response)
  })
  .catch( err => {
    res.status(500).json({
      error: err
    })
  })
});

router.get('/:userEmail', function (req, res, next) {
  User.find({ email: req.params.userEmail })
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        units: docs
      };
      res.status(200).json(response)
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
});

module.exports = router;
