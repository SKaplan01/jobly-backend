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

describe('Search for list companies', function() {
  it('should run the query string that was built in Company.getAll())', async function() {
    const response1 = await request(app).get('/companies');
    const response2 = await request(app).get('/companies?search=a');
    const response3 = await request(app).get('/companies?max=5');
    expect(response1.body.companies.length).toBe(3);
    expect(response2.body.companies.length).toBe(2);
    expect(response3.body.companies[0].name).toBe('axle');
    expect(response1.statusCode).toBe(200);
  });

  it('should return an error when max is less than min', async function() {
    const response = await request(app).get('/companies?min=10&max=9');
    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe(
      'min_employees must be less than max_employees'
    );
  });
});

afterEach(async function() {
  await db.query(`DELETE from companies`);
});

afterAll(async function() {
  await db.end();
});
