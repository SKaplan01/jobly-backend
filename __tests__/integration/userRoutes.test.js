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
    VALUES ('silas', '1234', 'Silas', 'Burger', 'silas@slytherin.edu')`
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
    // const dbData = await request(app).get('/companies');
    // expect(dbData.body.companies.length).toBe(4);
  });
});

afterEach(async function() {
  await db.query(`DELETE from users`);
});

afterAll(async function() {
  await db.end();
});
