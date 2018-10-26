const express = require('express');
const router = new express.Router();
const Job = require('../models/job');
const User = require('../models/user');
const createUserSchema = require('../schema/createUserSchema.json');
const { validate } = require('jsonschema');

// gets all jobs matching optional query string parameters
// and has up to 3 keys {search:"am", min_salary: 10, min_equity: .2}
// router.get('/', async function(req, res, next) {
//   try {
//     let { search, min_salary, min_equity } = req.query;
//     let jobs = await Job.getAll({ search, min_salary, min_equity });
//     return res.json({ jobs });
//   } catch (err) {
//     return next(err);
//   }
// });

//posts a new user to the database and return the user
router.post('/', async function(req, res, next) {
  try {
    const result = validate(req.body, createUserSchema);
    if (!result.valid) {
      let error = {};
      error.message = result.errors.map(error => error.stack);
      error.status = 400;
      return next(error);
    }
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url
    } = req.body;
    const user = await User.create({
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url
    });
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
