/** Job class for jobly */

const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Job {
  // takes object containing containing search, min_salary, and min_equity where values can be undefined
  // returns list of jobs filtered by search criteria
  static async getAll({ search, min_salary, min_equity }) {
    search = search === undefined ? '%%' : `${search}%`;
    min_salary = min_salary === undefined ? -1 : +min_salary;
    min_equity = min_equity === undefined ? -1 : +min_equity;
    let result = await db.query(
      `SELECT id, title, salary, equity, company_handle, date_posted FROM jobs WHERE (company_handle ILIKE $1 OR title ILIKE $1)
      AND salary>=$2 AND equity>=$3`,
      [search, min_salary, min_equity]
    );
    return result.rows;
  }

  // gets one job with a specific id
  static async getOne(id) {
    let result = await db.query(
      `SELECT id, title, salary, equity, company_handle, date_posted
      FROM jobs
      WHERE id=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      let error = new Error(`Job ${id} not found`);
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  }

  /** create new job -- returns
   *    {id, title, salary, equity, company_handle, date_posted}
   */
  static async create({ title, salary, equity, company_handle }) {
    try {
      let result = await db.query(
        `INSERT INTO jobs 
      (title, salary, equity, company_handle, date_posted)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, title, salary, equity, company_handle, date_posted`,
        [title, salary, equity, company_handle]
      );
      return result.rows[0];
    } catch (err) {
      let error = new Error('Cannot create this job. Invalid job data.');
      error.status = 422; // UNPROCESSABLE ENTITY
      throw error;
    }
  }

  // update data for one job. Returns updated job.
  static async updateOne(id, jobUpdates) {
    try {
      let { query, values } = sqlForPartialUpdate('jobs', jobUpdates, 'id', id);
      let result = await db.query(query, values);
      return result.rows[0];
    } catch (err) {
      let error = new Error('Cannot update this job. Invalid job data.');
      error.status = 400;
      throw error;
    }
  }

  //delete company from database
  static async deleteOne(id) {
    let result = await db.query(`DELETE FROM jobs WHERE id=$1 RETURNING id`, [
      id
    ]);
    if (result.rows.length === 0) {
      let error = new Error(`Company ${id} not found`);
      error.status = 404;
      throw error;
    }
  }
}

module.exports = Job;
