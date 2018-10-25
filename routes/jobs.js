const express = require('express');
const router = new express.Router();
const Job = require('../models/job');
const createJobSchema = require('../schema/createJobSchema.json');
const updateJobSchema = require('../schema/updateJobSchema.json');
// const updateCompanySchema = require('../schema/updateCompanySchema.json');
const { validate } = require('jsonschema');

// gets all jobs matching optional query string parameters
// and has up to 3 keys {search:"am", min_salary: 10, min_equity: .2}
router.get('/', async function(req, res, next) {
  try {
    let { search, min_salary, min_equity } = req.query;
    let jobs = await Job.getAll({ search, min_salary, min_equity });
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

//posts a new job to the database and returns the new job
router.post('/', async function(req, res, next) {
  try {
    const result = validate(req.body, createJobSchema);
    if (!result.valid) {
      let error = {};
      error.message = result.errors.map(error => error.stack);
      error.status = 400;
      return next(error);
    }
    const { title, salary, equity, company_handle } = req.body;
    const job = await Job.create({
      title,
      salary,
      equity,
      company_handle
    });
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// get data about specific job. Return JSON with info about this job
router.get('/:id', async function(req, res, next) {
  try {
    let { id } = req.params;
    let job = await Job.getOne(id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

//update job. Returns JSON with info about updated job
router.patch('/:id', async function(req, res, next) {
  try {
    const result = validate(req.body, updateJobSchema);
    if (!result.valid) {
      let error = {};
      error.message = result.errors.map(error => error.stack);
      error.status = 400;
      return next(error);
    }
    let { id } = req.params;
    let job = await Job.updateOne(id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// //delete company from database. Returns message
// router.delete('/:handle', async function(req, res, next) {
//   try {
//     let { handle } = req.params;
//     await Company.deleteOne(handle);
//     return res.json({ message: 'Company deleted' });
//   } catch (err) {
//     return next(err);
//   }
// });

module.exports = router;
