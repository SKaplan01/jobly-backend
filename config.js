/** Shared config for application; can be req'd many places. */

require('dotenv').config();

const SECRET = process.env.SECRET_KEY || 'test';

const PORT = +process.env.PORT || 3000;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'jobly-test'
// - else: 'jobly'

let DB_URI;
let WORK_FACTOR;

if (process.env.NODE_ENV === 'test') {
  DB_URI = 'jobly_test';
  WORK_FACTOR = 1;
} else {
  DB_URI = process.env.DATABASE_URL || 'jobly';
  WORK_FACTOR = 10;
}

module.exports = {
  SECRET,
  PORT,
  DB_URI,
  WORK_FACTOR
};
