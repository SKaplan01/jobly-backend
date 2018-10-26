process.env.NODE_ENV = 'test';
const Company = require('../../models/company');
const Job = require('../../models/job');
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');

beforeEach(async function() {
  await db.query(
    `INSERT INTO companies 
    (handle, name, num_employees, description)
    VALUES ('amz', 'amazon', 1000, 'controls the world'),
    ('google', 'google', '5000','made a search engine'),
    ('ax', 'axle', '4', 'make media management software')`
  );
  await db.query(
    `INSERT INTO jobs 
    (title, salary, equity, company_handle, date_posted)
    VALUES ('software', 100000, 0.2, 'amz', CURRENT_TIMESTAMP),
    ('cook', 60000, 0, 'google', CURRENT_TIMESTAMP),
    ('QA tester', 70000, 0.3, 'google', CURRENT_TIMESTAMP)`
  );
});

describe('Search for a list of jobs', function() {
  it('should return correctly filtered list of jobs', async function() {
    const result1 = await Job.getAll({
      search: undefined,
      min_salary: undefined,
      min_equity: undefined
    });

    const result2 = await Job.getAll({
      search: 'goo',
      min_salary: 20,
      min_equity: 0.2
    });

    const result3 = await Job.getAll({
      search: 'goo',
      min_salary: undefined,
      min_equity: 0
    });

    const result4 = await Job.getAll({
      search: 'amz',
      min_salary: undefined,
      min_equity: 0,
      location: 'San Francisco'
    });

    const result5 = await Job.getAll({
      search: 'amz',
      min_salary: undefined,
      min_equity: -10
    });

    expect(result1.length).toBe(3);
    expect(result2[0].title).toBe('QA tester');
    expect(result3.length).toBe(2);
    expect(result3[0].company_handle).toBe('google');
    expect(result4[0].company_handle).toBe('amz');
    expect(result5[0].title).toBe('software');
  });

  it('should return an empty array when no jobs match search criteria', async function() {
    const result1 = await Job.getAll({
      search: 'kkjsefeskjhfekjhwe',
      min_salary: undefined,
      min_equity: undefined
    });

    const result2 = await Job.getAll({
      search: 'amz',
      min_salary: 900000000000000000,
      min_equity: undefined
    });

    const result3 = await Job.getAll({
      search: 'amz',
      min_salary: undefined,
      min_equity: 2
    });

    expect(result1.length).toBe(0);
    expect(result2.length).toBe(0);
    expect(result3.length).toBe(0);
  });
});

afterEach(async function() {
  await db.query(`DELETE from companies`);
});

afterAll(async function() {
  await db.end();
});
