/** Company class for jobly */

const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Company {
  //takes optional argument that is an object
  //and has up to 3 keys {search:"am", min_employees: 10, max_employees: 100}
  //returns object that contains key of baseQuery with value of query string and key of values with query data
  static buildQueryGetAll(...args) {
    let values = [];
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
          let error = new Error(
            'min_employees must be less than max_employees'
          );
          error.status = 422;
          throw error;
        }
      }
    }
    return { baseQuery, values };
  }

  //runs query that was built in buildQueryGetAll()
  //return result.rows from db
  static async runQueryGetAll({ baseQuery, values }) {
    let results = await db.query(baseQuery, values);
    return results.rows;
  }

  //gets one company with a specific handle
  static async getOne(handle) {
    let result = await db.query(
      `SELECT handle, name, num_employees, description, logo_url 
      FROM companies
      WHERE handle=$1`,
      [handle]
    );
    if (result.rows.length === 0) {
      let error = new Error(`Company ${handle} not found`);
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  }

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

  //update data for one company. Returns updated company.
  static async updateOne(handle, companyUpdates) {
    let { query, values } = sqlForPartialUpdate(
      'companies',
      companyUpdates,
      'handle',
      handle
    );
    let result = await db.query(query, values);
    return result.rows[0];
  }

  //delete company from database
  static async deleteOne(handle) {
    db.query(`DELETE FROM companies WHERE handle=$1`, [handle]);
  }
}

module.exports = Company;
