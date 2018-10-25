/** Company class for jobly */

const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Company {
  //takes object containing optional search, min, and max
  //returns list of companies filtered by search criteria
  static async getAll({ search, min, max }) {
    search = search === undefined ? '%%' : `${search}%`;
    min = min === undefined ? -1 : +min;
    max = max === undefined ? 1000000000 : +max;
    if (min > max) {
      let error = new Error('min_employees must be less than max_employees');
      error.status = 422;
      throw error;
    }
    //allows for search results to include companies who did not disclose num_employees (it's null)
    let result = await db.query(
      `SELECT handle, name, num_employees, description, logo_url 
      FROM companies 
      WHERE (handle ILIKE $1 OR name ILIKE $1)
      AND (num_employees>=$2 AND num_employees<=$3) 
      OR (num_employees IS null)`,
      [search, min, max]
    );
    return result.rows;
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

  static async getJobs(handle) {
    let result = await db.query(
      `SELECT id, title, salary, equity, 
    company_handle, date_posted FROM jobs WHERE company_handle=$1`,
      [handle]
    );

    return result.rows;
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
