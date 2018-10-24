process.env.NODE_ENV = 'test';
const Company = require('../../models/companies');

describe('Company.buildQueryGetAll()', function() {
  it('should return an object containing query string and values', function() {
    const result1 = Company.buildQueryGetAll();

    const result2 = Company.buildQueryGetAll({
      search: 'am'
    });

    const result3 = Company.buildQueryGetAll({
      search: 'am',
      min_employees: 10
    });

    const result4 = Company.buildQueryGetAll({
      search: 'am',
      min_employees: 10,
      max_employees: 100
    });

    expect(result1).toEqual({
      baseQuery: `SELECT handle, name, num_employees, description, logo_url FROM companies`,
      values: []
    });

    expect(result2.baseQuery).toBe(
      `SELECT handle, name, num_employees, description, logo_url FROM companies WHERE (handle LIKE $1 OR name LIKE $1)`
    );

    expect(result3.baseQuery).toBe(
      `SELECT handle, name, num_employees, description, logo_url FROM companies WHERE (handle LIKE $1 OR name LIKE $1) AND num_employees>$2`
    );

    expect(result4.baseQuery).toBe(
      `SELECT handle, name, num_employees, description, logo_url FROM companies WHERE (handle LIKE $1 OR name LIKE $1) AND num_employees>$2 AND num_employees<$3`
    );

    expect(result4.values).toEqual(['am%', 10, 100]);
  });
});
