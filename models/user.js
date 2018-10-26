const db = require('../db');
const bcrypt = require('bcrypt');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const { WORK_FACTOR } = require('../config.js');

class User {
  //returns list of users
  static async getAll() {
    let result = await db.query(
      `SELECT username, first_name, last_name, email FROM users`
    );
    return result.rows;
  }

  // //gets one user with a specific username
  static async getOne(username) {
    let result = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
      FROM users
      WHERE username=$1`,
      [username]
    );

    if (result.rows.length === 0) {
      let error = new Error(`Company ${username} not found`);
      error.status = 404;
      throw error;
    }

    return result.rows[0];
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
    try {
      const hashedPassword = await bcrypt.hash(password, WORK_FACTOR);
      let result = await db.query(
        `INSERT INTO users 
      (username, password, first_name, last_name, email, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, first_name, last_name, email, photo_url, is_admin`,
        [username, hashedPassword, first_name, last_name, email, photo_url]
      );
      return result.rows[0];
    } catch (err) {
      let error = new Error(err.detail);
      error.status = 400;
      throw error;
    }
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
