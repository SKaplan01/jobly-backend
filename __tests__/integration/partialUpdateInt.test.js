process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const sqlForPartialUpdate = require('../../helpers/partialUpdate');

beforeEach(async function() {
  await db.query(
    `INSERT INTO companies 
    (handle, name, num_employees, description, logo_url)
    VALUES ('amz', 'amazon', 1000, 'controls the world')`
  );
});

//this test doesn't work yet
describe('partialUpdate()', function() {
  it('should generate a proper partial update query with just 1 field', async function() {
    const query = sqlForPartialUpdate(
      'companies',
      { num_employees: 3000 },
      'handle',
      'amz'
    );
    console.log(query);
    //need to destructure query and pass in differently
    const result = await db.query(query);
    const updatedData = result.rows[0];
    expect(updatedData.num_employees).toBe(3000);
    expect(updatedData.name).toBe('amazon');
    expect(result.statusCode).toBe(200);
  });
});

afterEach(async function() {
  await db.query(`DELETE from companies`);
});

afterAll(async function() {
  await db.end();
});
