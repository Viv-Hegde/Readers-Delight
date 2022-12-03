"use strict";

const express = require('express');
const app = express();

// other required modules ...
const multer = require("multer");

// for application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const INVALID_PARAM_ERROR = 400;
const INVALID_PARAM_ERROR_MSG = "Missing one or more of the required params..";
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG = "An error occurred on the server. Try again later.";

/**
 * define endpoints here
 * use app.get() and app.post()
 * use req.params.paramname and req.query.paramname for get()
 * use req.body.paramname for post()
 * remember to use try-catch block for each endpoint
 * remmber to "let db = await getDBConnection();" and "db.close();"
 * remember whenever you are using user input for database use placeholders (?)
 */

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection.
 */
 async function getDBConnection() {
  const db = await sqlite.open({
      filename: 'books.db',
      driver: sqlite3.Database
  });

  return db;
}

//front-end is in 'public' folder directory
app.use(express.static('public'));
// Allows us to change the port easily by setting an environment
const PORT = process.env.PORT || 8000;
app.listen(PORT);
