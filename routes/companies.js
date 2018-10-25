const express = require('express');
const router = new express.Router();
const Company = require('../models/company');
const createCompanySchema = require('../schema/createCompanySchema.json');
const updateCompanySchema = require('../schema/updateCompanySchema.json');
const { validate } = require('jsonschema');

//gets all companies matching optional query string parameters
//and has up to 3 keys {search:"am", min_employees: 10, max_employees: 100}
router.get('/', async function(req, res, next) {
  try {
    let { search, min, max } = req.query;
    let companies = await Company.getAll({ search, min, max });
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

//posts a new company to the database and returns the new company
router.post('/', async function(req, res, next) {
  try {
    const result = validate(req.body, createCompanySchema);
    if (!result.valid) {
      let error = {};
      error.message = result.errors.map(error => error.stack);
      error.status = 400;
      return next(error);
    }
    const { handle, name, num_employees, description, logo_url } = req.body;
    const company = await Company.create({
      handle,
      name,
      num_employees,
      description,
      logo_url
    });
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

//get data about specific company. Return JSON with info about this company
router.get('/:handle', async function(req, res, next) {
  try {
    let { handle } = req.params;
    let company = await Company.getOne(handle);
    let jobs = await Company.getJobs(handle);
    company.jobs = jobs;
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

//update company. Returns JSON with info about updated company
router.patch('/:handle', async function(req, res, next) {
  try {
    const result = validate(req.body, updateCompanySchema);
    if (!result.valid) {
      let error = {};
      error.message = result.errors.map(error => error.stack);
      error.status = 400;
      return next(error);
    }
    let { handle } = req.params;
    let company = await Company.updateOne(handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

//delete company from database. Returns message
router.delete('/:handle', async function(req, res, next) {
  try {
    let { handle } = req.params;
    await Company.deleteOne(handle);
    return res.json({ message: 'Company deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
