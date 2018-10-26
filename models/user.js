const db = require('../db');
const bcrypt = require('bcrypt');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const { WORK_FACTOR } = require('../config.js');

class User {
  //returns list of users
  static async getAll() {
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

  /** register new user -- returns
   *    {username, first_name, last_name, email, photo_url, is_admin}
   */
  static async create({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url
  }) {
    const hashedPassword = await bcrypt.hash(password, WORK_FACTOR);
    let result = await db.query(
      `INSERT INTO users 
      (username, password, first_name, last_name, email, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, first_name, last_name, email, photo_url, is_admin`,
      [username, hashedPassword, first_name, last_name, email, photo_url]
    );
    return result.rows[0];
  }

  //update data for one company. Returns updated company.
  static async updateOne(handle, companyUpdates) {
    try {
      let { query, values } = sqlForPartialUpdate(
        'companies',
        companyUpdates,
        'handle',
        handle
      );
      let result = await db.query(query, values);
      return result.rows[0];
    } catch (err) {
      let error = new Error(
        'Cannot update this company. Invalid company data.'
      );
      error.status = 400;
      throw error;
    }
  }

  //delete company from database
  static async deleteOne(handle) {
    let result = await db.query(
      `DELETE FROM companies WHERE handle=$1 RETURNING handle`,
      [handle]
    );
    if (result.rows.length === 0) {
      let error = new Error(`Company ${handle} not found`);
      error.status = 404;
      throw error;
    }
  }
}

module.exports = User;
