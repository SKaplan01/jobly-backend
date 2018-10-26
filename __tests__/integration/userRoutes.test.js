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

afterEach(async function() {
  await db.query(`DELETE from users`);
});

afterAll(async function() {
  await db.end();
});
