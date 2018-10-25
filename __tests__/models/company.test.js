process.env.NODE_ENV = 'test';
const Company = require('../../models/company');
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');

//unit test?

beforeEach(async function() {
  await db.query(
    `INSERT INTO companies 
    (handle, name, num_employees, description)
    VALUES ('amz', 'amazon', 1000, 'controls the world'),
    ('goog', 'google', '5000','made a search engine'),
    ('ax', 'axle', '4', 'make media management software')`
  );

  await db.query(
    `INSERT INTO jobs 
    (id, title, salary, equity, company_handle, date_posted)
    VALUES (1, 'software', 100000, 0.2, 'amz', CURRENT_TIMESTAMP),
    (2, 'cook', 60000, 0, 'amz', CURRENT_TIMESTAMP)`
  );
});

describe('Search for list of companies', function() {
  it('should return correctly filtered list of companies', async function() {
    const result1 = await Company.getAll({
      search: 'am',
      min: 10,
      max: 70000
    });

    const result2 = await Company.getAll({
      search: 'goo',
      min: 20,
      max: undefined
    });

    const result3 = await Company.getAll({
      search: undefined,
      min: undefined,
      max: 5
    });

    const result4 = await Company.getAll({
      search: 'a',
      min: 1,
      max: undefined
    });

    const result5 = await Company.getAll({
      search: 'am',
      min: undefined,
      max: undefined,
      color: 'Red'
    });

    expect(result1[0].name).toBe('amazon');
    expect(result2[0].name).toBe('google');
    expect(result3[0].name).toBe('axle');
    expect(result4.length).toBe(2);
    expect(result5[0].name).toBe('amazon');
  });
});

describe('Search for list of jobs from one company', function() {
  it('should return all jobs posted by that company', async function() {
    const result = await Company.getJobs('amz');
    expect(result.length).toBe(2);
  });
});

afterEach(async function() {
  await db.query(`DELETE from companies`);
});

afterAll(async function() {
  await db.end();
});
