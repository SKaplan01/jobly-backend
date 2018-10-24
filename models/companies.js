/** Company class for jobly */

const db = require('../db');

class Company {
  //takes optional argument that is an object
  //and has up to 3 keys {search:"am", min_employees: 10, max_employees: 100}
  //returns object that contains key of baseQuery with value of query string and key of values with query data
  static buildQueryGetAll(...args) {
    let values = [];
    console.log(args);
    let baseQuery = `SELECT handle, name, num_employees, description, logo_url FROM companies`;
    if (args.length === 0) {
      return { baseQuery, values };
    } else {
      baseQuery = `${baseQuery} WHERE`;
    }
    if (args[0].search) {
      values.push(`${args[0].search}%`);
      baseQuery = `${baseQuery} (handle LIKE $1 OR name LIKE $1)`;
    }
    if (args[0].min_employees) {
      values.push(+args[0].min_employees);
      if (values.length > 1) {
        baseQuery = `${baseQuery} AND num_employees>$2`;
      } else {
        baseQuery = `${baseQuery} num_employees>$1`;
      }
    }
    if (args[0].max_employees) {
      values.push(+args[0].max_employees);
      if (values.length > 1) {
        baseQuery = `${baseQuery} AND num_employees<$3`;
      } else {
        baseQuery = `${baseQuery} num_employees<$1`;
      }
      if (args[0].min_employees && args[0].max_employees) {
        if (+args[0].min_employees > +args[0].max_employees) {
          throw new Error('min must be less than max');
        }
      }
    }
    return { baseQuery, values };
  }

  //runs query that was built in buildQueryGetAll()
  //return result.rows from db
  static async runQueryGetAll({ baseQuery, values }) {
    console.log(baseQuery, values);
    let results = await db.query(baseQuery, values);
    return results.rows;
  }

  //TODO make getter and setter to lowercase handle and use lowercase version in db

  /** register new company -- returns
   *    {handle, name, num_employees, description, logo_url}
   */
  static async create({ handle, name, num_employees, description, logo_url }) {
    let result = await db.query(
      `INSERT INTO companies 
      (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );
    return result.rows[0];
  }
}

module.exports = Company;
