process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');

beforeEach(async function() {
  await db.query(
    `INSERT INTO companies 
    (handle, name, num_employees, description)
    VALUES ('amz', 'amazon', 1000, 'controls the world'),
    ('goog', 'google', '5000','made a search engine'),
    ('ax', 'axle', '4', 'make media management software')`
  );
});

describe('Make post to add company', function() {
  it('should insert new company into db and return company object', async function() {
    const response = await request(app)
      .post('/companies')
      .send({ handle: 'starb', name: 'Starbucks' });
    const dbData = await request(app).get('/companies');
    expect(response.body.company.name).toBe('Starbucks');
    expect(response.body.company).toHaveProperty('num_employees');
    expect(response.statusCode).toBe(200);
    expect(dbData.body.companies.length).toBe(4);
  });
});

describe('Make invalid post to add company', function() {
  it('should return error when posting new company with invalid data', async function() {
    const response1 = await request(app)
      .post('/companies')
      .send({ handle: 'cat' });
    const response2 = await request(app)
      .post('/companies')
      .send({ handle: 'cat', name: 'cats company', num_employees: -9 });
    const dbData = await request(app).get('/companies');
    expect(response1.statusCode).toBe(400);
    expect(response2.statusCode).toBe(400);
    expect(dbData.body.companies.length).toBe(3);
  });
});

describe('Get one company by handle', function() {
  it('should return one company matching the given handle', async function() {
    const response = await request(app).get('/companies/amz');
    expect(response.body.company.name).toBe('amazon');
    expect(response.statusCode).toBe(200);
  });
});

describe('Get one company with invalid handle', function() {
  it('should return error given an invalid handle', async function() {
    const response = await request(app).get('/companies/foo');
    expect(response.statusCode).toBe(404);
  });
});

afterEach(async function() {
  await db.query(`DELETE from companies`);
});

afterAll(async function() {
  await db.end();
});
