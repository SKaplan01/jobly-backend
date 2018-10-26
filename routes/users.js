const express = require('express');
const router = new express.Router();
const Job = require('../models/job');
const User = require('../models/user');
const createUserSchema = require('../schema/createUserSchema.json');
const updateUserSchema = require('../schema/updateUserSchema.json');
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

// get data about specific user. Return JSON with info about this user
router.get('/:username', async function(req, res, next) {
  try {
    let { username } = req.params;
    let user = await User.getOne(username);
    return res.json({ user });
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

router.patch('/:username', async function(req, res, next) {
  try {
    const result = validate(req.body, updateUserSchema);
    if (!result.valid) {
      let error = {};
      error.message = result.errors.map(error => error.stack);
      error.status = 400;
      return next(error);
    }
    let { username } = req.params;
    let user = await User.updateOne(username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

//delete user from database. Returns message
router.delete('/:username', async function(req, res, next) {
  try {
    let { username } = req.params;
    await User.deleteOne(username);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
