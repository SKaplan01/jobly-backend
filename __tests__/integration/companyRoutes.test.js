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

  await db.query(
    `INSERT INTO jobs 
    (id, title, salary, equity, company_handle, date_posted)
    VALUES (1, 'software', 100000, 0.2, 'amz', CURRENT_TIMESTAMP),
    (2, 'cook', 60000, 0, 'amz', CURRENT_TIMESTAMP)`
  );
});

describe('POST /companies', function() {
  it('should insert new company into db and return company object', async function() {
    const response = await request(app)
      .post('/companies')
      .send({ handle: 'starb', name: 'Starbucks' });
    expect(response.body.company.name).toBe('Starbucks');
    expect(response.body.company).toHaveProperty('num_employees');
    expect(response.statusCode).toBe(200);
    const dbData = await request(app).get('/companies');
    expect(dbData.body.companies.length).toBe(4);
  });

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

describe('GET /companies', function() {
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

describe('GET /companies/:handle', function() {
  it('should return one company matching the given handle', async function() {
    const response = await request(app).get('/companies/amz');
    expect(response.body.company.name).toBe('amazon');
    expect(response.body.company.jobs.length).toBe(2);
    expect(response.statusCode).toBe(200);
  });
  it('should return error given an invalid handle', async function() {
    const response = await request(app).get('/companies/foo');
    expect(response.statusCode).toBe(404);
  });
});

describe('PATCH /companies/:handle', function() {
  it('should return the updated company', async function() {
    const response = await request(app)
      .patch('/companies/amz')
      .send({ num_employees: 500, description: 'sends drones to your house' });
    expect(response.body.company.num_employees).toBe(500);
    expect(response.body.company.description).toBe(
      'sends drones to your house'
    );
    expect(response.body.company.name).toBe('amazon');
    expect(response.statusCode).toBe(200);
  });
  it('should return error if data to update is invalid', async function() {
    const response = await request(app)
      .patch('/companies/amz')
      .send({
        num_employees: 500,
        description: 'sends drones to your house',
        cats: true
      });
    expect(response.statusCode).toBe(400);
  });
  it('should return error given an invalid handle', async function() {
    const response = await request(app).patch('/companies/foo');
    expect(response.statusCode).toBe(400);
  });
});

describe('DELETE /companies/:handle', function() {
  it('should delete a company from database and return a message - company deleted', async function() {
    const response = await request(app).delete('/companies/amz');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Company deleted');

    const dbData = await request(app).get('/companies');
    expect(dbData.body.companies.length).toBe(2);
  });
  it('should return error given an invalid handle', async function() {
    const response = await request(app).delete('/companies/foo');
    expect(response.statusCode).toBe(404);
  });
});

describe('Go to invalid route', function() {
  it('should return a 404 error', async function() {
    const response = await request(app).get('/rithm');
    expect(response.statusCode).toBe(404);
  });
});

afterEach(async function() {
  await db.query(`DELETE from companies`);
});

afterAll(async function() {
  await db.end();
});
