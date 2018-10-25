process.env.NODE_ENV = 'test';
const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', function() {
  it('should generate a proper partial update query with just 1 field - companies table', function() {
    const query = sqlForPartialUpdate(
      'companies',
      { num_employees: 3000 },
      'handle',
      'amz'
    );
    expect(query.query).toBe(
      'UPDATE companies SET num_employees=$1 WHERE handle=$2 RETURNING *'
    );
    expect(query.values).toEqual([3000, 'amz']);
  });

  it('should generate a proper partial update query with just 1 field - jobs table', function() {
    const query = sqlForPartialUpdate('jobs', { salary: 3000 }, 'id', 1);
    expect(query.query).toBe(
      'UPDATE jobs SET salary=$1 WHERE id=$2 RETURNING *'
    );
    expect(query.values).toEqual([3000, 1]);
  });

  it('should delete keys that start with _', function() {
    const query = sqlForPartialUpdate(
      'jobs',
      { _salary: 3000, equity: 0.2 },
      'id',
      1
    );
    expect(query.query).toBe(
      'UPDATE jobs SET equity=$1 WHERE id=$2 RETURNING *'
    );
    expect(query.values).toEqual([0.2, 1]);
  });
});
