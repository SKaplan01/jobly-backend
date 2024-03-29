process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');

let job_id;

beforeEach(async function() {
  await db.query(
    `INSERT INTO companies 
    (handle, name, num_employees, description)
    VALUES ('amz', 'amazon', 1000, 'controls the world'),
    ('google', 'google', '5000','made a search engine'),
    ('starb', 'starbucks', '4', 'make coffee')`
  );
  const jobQuery = await db.query(
    `INSERT INTO jobs 
    (title, salary, equity, company_handle, date_posted)
    VALUES ('software', 100000, 0.2, 'amz', CURRENT_TIMESTAMP),
    ('cook', 60000, 0, 'google', CURRENT_TIMESTAMP),
    ('QA tester', 70000, 0.3, 'google', CURRENT_TIMESTAMP) RETURNING id`
  );
  job_id = jobQuery.rows[0].id;
});

describe('POST /jobs', function() {
  it('should insert new job into db and return job object', async function() {
    const response = await request(app)
      .post('/jobs')
      .send({
        title: 'barista',
        salary: 540000,
        equity: 0,
        company_handle: 'starb'
      });
    expect(response.body.job.title).toBe('barista');
    expect(response.body.job).toHaveProperty('equity');
    expect(response.statusCode).toBe(200);
    const dbData = await request(app).get('/jobs');
    expect(dbData.body.jobs.length).toBe(4);
  });

  it('should return error when posting a job with invalid data', async function() {
    const response1 = await request(app)
      .post('/jobs')
      .send({ company_handle: 'amz' });
    const response2 = await request(app)
      .post('/jobs')
      .send({
        id: 5,
        company_handle: 'cat',
        title: 'cats trainer',
        salary: 30000,
        equity: 0.2
      });
    const response3 = await request(app)
      .post('/jobs')
      .send({
        id: 6,
        company_handle: 'google',
        title: 'cats video maker',
        salary: -30000,
        equity: 0.2
      });
    const response4 = await request(app)
      .post('/jobs')
      .send({
        id: 7,
        company_handle: 'amz',
        title: 'cats analyst',
        salary: 30000,
        equity: 1.2
      });
    expect(response1.statusCode).toBe(400);
    expect(response2.statusCode).toBe(422); // not related to json schema. Error thrown in model when inserting job for company that doesn't exist
    expect(response3.statusCode).toBe(400);
    expect(response4.statusCode).toBe(400);
    const dbData = await request(app).get('/jobs');
    expect(dbData.body.jobs.length).toBe(3);
  });
});

describe('GET /jobs', function() {
  it('should get list of jobs that matches search criteria)', async function() {
    const response1 = await request(app).get('/jobs');
    const response2 = await request(app).get('/jobs?search=g');
    const response3 = await request(app).get('/jobs?search=g&min_salary=65000');
    expect(response1.body.jobs.length).toBe(3);
    expect(response2.body.jobs.length).toBe(2);
    expect(response3.body.jobs[0].company_handle).toBe('google');
    expect(response1.statusCode).toBe(200);
  });

  it('should return an empty array when no results match search criteria', async function() {
    const response = await request(app).get('/jobs?min_salary=900000000');
    expect(response.statusCode).toBe(200);
    expect(response.body.jobs.length).toBe(0);
  });
});

describe('GET /jobs/:id', function() {
  it('should return one job matching the given id', async function() {
    const response = await request(app).get(`/jobs/${job_id}`);
    expect(response.body.job.company_handle).toBe('amz');
    expect(response.statusCode).toBe(200);
  });
  it('should return error given an invalid id', async function() {
    const response = await request(app).get('/jobs/500');
    expect(response.statusCode).toBe(404);
  });
  it('should return error given an invalid id', async function() {
    const response = await request(app).get('/jobs/500');
    expect(response.statusCode).toBe(404);
  });
});

describe('PATCH /jobs/:id', function() {
  it('should return the updated job', async function() {
    const response = await request(app)
      .patch(`/jobs/${job_id}`)
      .send({ salary: 50000, title: 'web development' });
    console.log(response.body);
    expect(response.body.job.salary).toBe(50000);
    expect(response.body.job.title).toBe('web development');
    expect(response.statusCode).toBe(200);
  });
  it('should return error if data to update is invalid', async function() {
    const response = await request(app)
      .patch(`/jobs/${job_id}`)
      .send({
        salary: 50000,
        title: 'web development',
        cats: true
      });
    expect(response.statusCode).toBe(400);
  });
  it('should return error if equity is more than 1', async function() {
    const response = await request(app)
      .patch(`/jobs/${job_id}`)
      .send({
        equity: 2,
        title: 'web development'
      });
    expect(response.statusCode).toBe(400);
  });
  it('should return error given an invalid id', async function() {
    const response = await request(app).patch('/jobs/500');
    expect(response.statusCode).toBe(400);
  });
});

describe('DELETE /jobs/:id', function() {
  it('should delete a job from database and return a message - job deleted', async function() {
    const response = await request(app).delete(`/jobs/${job_id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Job deleted');

    const dbData = await request(app).get('/jobs');
    expect(dbData.body.jobs.length).toBe(2);
  });
  it('should return error given an invalid id', async function() {
    const response = await request(app).delete('/jobs/500');
    expect(response.statusCode).toBe(404);
  });
});

describe('Go to invalid route', function() {
  it('should return a 404 error', async function() {
    const response = await request(app).get('/silas');
    expect(response.statusCode).toBe(404);
  });
});

afterEach(async function() {
  await db.query(`DELETE from jobs`);
  await db.query(`DELETE from companies`);
});

afterAll(async function() {
  await db.end();
});
