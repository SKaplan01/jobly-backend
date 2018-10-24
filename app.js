/** Express app for jobly. */

const express = require('express');
const app = express();
app.use(express.json());
const companiesRoutes = require('./routes/companies');
// add logging system

const morgan = require('morgan');
app.use(morgan('tiny'));

//add routes
app.use('/companies', companiesRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;
