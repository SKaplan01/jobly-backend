const express = require('express');
const router = new express.Router();
const Job = require('../models/job');
const User = require('../models/user');
const createUserSchema = require('../schema/createUserSchema.json');
const { validate } = require('jsonschema');

//returns JSON which contains all users information
router.get('/', async function(req, res, next) {
  try {
    let users = await User.getAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

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
