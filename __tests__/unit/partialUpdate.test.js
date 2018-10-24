process.env.NODE_ENV = 'test';
const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', function() {
  it('should generate a proper partial update query with just 1 field', function() {
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
});
