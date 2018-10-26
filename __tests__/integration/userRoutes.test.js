process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');

beforeEach(async function() {
  await db.query(
    `INSERT INTO users 
    (username,
      password,
      first_name,
      last_name,
      email)
    VALUES ('silas', '1234', 'Silas', 'Burger', 'silas@slytherin.edu'),
     ('juan' , '1234' , 'Juan', 'Areces', 'reqthatbody@gmail.com')`
  );
});

describe('POST /users', function() {
  it('should insert new user into db and return user object', async function() {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'hasi',
        password: 'plaintext',
        first_name: 'Hasi',
        last_name: 'Dunno',
        email: 'hasi@gmail.com'
      });
    expect(response.body.user.first_name).toBe('Hasi');
    expect(response.statusCode).toBe(200);
    const dbData = await request(app).get('/users');
    expect(dbData.body.users.length).toBe(3);
  });
  it('should return an error when data is invalid', async function() {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'hasi',
        password: 'plaintext',
        first_name: 'Hasi',
        last_name: 'Dunno',
        email: 'assajkadlksjklasd'
      });
    const response2 = await request(app)
      .post('/users')
      .send({
        username: 'sarah',
        password: 'plaintext',
        last_name: 'Dunno',
        email: 'hasi@gmail.com'
      });
    //dummy data so response 4 fails
    const response3 = await request(app)
      .post('/users')
      .send({
        username: 'zac',
        password: 'plaintext',
        first_name: 'Hasi',
        last_name: 'Dunno',
        email: 'hasi@gmail.com'
      });

    const response4 = await request(app)
      .post('/users')
      .send({
        username: 'zac',
        password: 'plaintext',
        first_name: 'Hasi',
        last_name: 'Dunno',
        email: 'hasi@gmail.com'
      });
    expect(response.statusCode).toBe(400);
    expect(response2.statusCode).toBe(400);
    expect(response4.statusCode).toBe(400);
  });
});

describe('GET /users', function() {
  it('should return a list of users', async function() {
    const response = await request(app).get('/users');
    expect(response.body.users.length).toBe(2);
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /users/:username', function() {
  it('should return one user matching the given username', async function() {
    const response = await request(app).get('/users/silas');
    expect(response.body.user.username).toBe('silas');
    expect(response.body.user.email).toBe('silas@slytherin.edu');
    expect(response.statusCode).toBe(200);
  });
  it('should return error given an invalid username', async function() {
    const response = await request(app).get('/users/foo');
    expect(response.statusCode).toBe(404);
  });
});

describe('PATCH /users/:username', function() {
  it('should return the updated user', async function() {
    const response = await request(app)
      .patch('/users/silas')
      .send({
        last_name: 'Slytherin',
        email: 'silas@gmail.com'
      });
    expect(response.body.user.last_name).toBe('Slytherin');
    expect(response.body.user.email).toBe('silas@gmail.com');
    expect(response.statusCode).toBe(200);
  });
  it('should return error if data to update is invalid', async function() {
    const response1 = await request(app)
      .patch('/users/silas')
      .send({
        last_name: 'Slytherin',
        email: 'silas@gmail.com',
        cats: true
      });
    const response2 = await request(app)
      .patch('/users/silas')
      .send({
        last_name: 'Slytherin',
        email: 'asjksakldjaskljdklas'
      });
    expect(response1.statusCode).toBe(400);
    expect(response2.statusCode).toBe(400);
  });
  it('should return error given an invalid username', async function() {
    const response = await request(app).patch('/users/foo');
    expect(response.statusCode).toBe(400);
  });
});

describe('DELETE /users/:username', function() {
  it('should delete a user from database and return a message - user deleted', async function() {
    const response = await request(app).delete('/users/silas');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User deleted');

    const dbData = await request(app).get('/users');
    expect(dbData.body.users.length).toBe(1);
  });
  it('should return error given an invalid handle', async function() {
    const response = await request(app).delete('/users/foo');
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
  await db.query(`DELETE from users`);
});

afterAll(async function() {
  await db.end();
});
