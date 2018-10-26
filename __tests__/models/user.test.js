process.env.NODE_ENV = 'test';
// const Company = require('../../models/company');
// const Job = require('../../models/job');
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const { WORK_FACTOR } = require('../../config.js');

beforeEach(async function() {});

describe('Add user to db and hash password', function() {
  it('should return a user and store hashed password in db', async function() {
    const result = await User.create({
      username: 'silas',
      password: '1234',
      first_name: 'Silas',
      last_name: 'Burger',
      email: 'snake@hogwarts.edu'
    });

    const pwInDb = await db.query(
      `SELECT password
       FROM users WHERE username='silas'`
    );
    let result2 = await bcrypt.compare('1234', pwInDb.rows[0].password);
    expect(result.username).toBe('silas');
    expect(result.is_admin).toBe(false);
    expect(result2).toEqual(true);
  });
});

afterEach(async function() {
  await db.query(`DELETE from users`);
});

afterAll(async function() {
  await db.end();
});
