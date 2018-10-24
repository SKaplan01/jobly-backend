const express = require('express');
const router = new express.Router();
const Company = require('../models/companies');
const createCompanySchema = require('../schema/createCompanySchema.json');
const { validate } = require('jsonschema');

//gets all companies matching optional query string parameters
//and has up to 3 keys {search:"am", min_employees: 10, max_employees: 100}
router.get('/', async function(req, res, next) {
  try {
    let companies;
    if (Object.keys(req.query).length === 0) {
      let queryValuesObject = Company.buildQueryGetAll();
      companies = await Company.runQueryGetAll(queryValuesObject);
    } else {
      let { search, min_employees, max_employees } = req.query;
      let queryValuesObject = Company.buildQueryGetAll({
        search,
        min_employees,
        max_employees
      });
      companies = await Company.runQueryGetAll(queryValuesObject);
    }
    return res.json({ companies });
  } catch (err) {
    next(err);
  }
});

//posts a new company to the database and returns the new company
router.post('/', async function(req, res, next) {
  try {
    const result = validate(req.body, createCompanySchema);
    if (!result.valid) {
      console.log('validator: result not valid');
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
    next(err);
  }
});

router.get('/:handle', async function(req, res, next) {
  try {
    let { handle } = req.params;
    let company = await Company.getOne(handle);
    return res.json({ company });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
