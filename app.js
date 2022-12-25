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
const INVALID_PARAM_ERROR_MSG = "Invalid parameters. Please try again";
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

// This endpoint handles:
// get all books
// get books with specific genre
app.get("/books/genre/:genre", async (req, res) => {
  try {
    let genre = req.params.genre;
    let db = await getDBConnection();
    let queryText = "SElECT id, Genre, Title, Author, Price, Stock " +
    "FROM books";
    let extra = " WHERE Genre LIKE ?;"
    let result;
    if (genre === "all") {
      result = await db.all(queryText);
    } else {
      queryText += extra;
      result = await db.all(queryText, "%" + genre + "%");
    }
    if (result.length === 0) {
      res.status(INVALID_PARAM_ERROR);
      res.type("text").send(INVALID_PARAM_ERROR_MSG);
    } else {
      res.json({
        "books": result
      });
    }

    db.close();
  } catch (error) {
    res.status(SERVER_ERROR);
    res.type("text").send(SERVER_ERROR_MSG);
  }
});

// This endpoint handles:
// returns all titles with the search keyword in it regardless of genre
app.get("/books/search/:title", async (req, res) => {
  try {
    let title = req.params.title;
    let db = await getDBConnection();
    let queryText = "SElECT id, Genre, Title, Author, Price, Stock " +
    "FROM books WHERE Title LIKE ?;";

    let result = await db.all(queryText, "%" + title + "%");

    if (result.length === 0) {
      res.type("text").send("No Books Found :(");
    } else {
      res.json({
        "books": result
      });
    }

    db.close();
  } catch (error) {
    res.status(SERVER_ERROR);
    res.type("text").send(SERVER_ERROR_MSG);
  }
});

// This endpoint returns all distinct genres in the database
app.get("/books/all_genres", async (req, res) => {
  try {
    let db = await getDBConnection();
    let queryText = "SElECT DISTINCT Genre FROM books";

    let result = await db.all(queryText);

    if (result.length === 0) {
      res.status(SERVER_ERROR);
      res.type("text").send(SERVER_ERROR_MSG);
    } else {
      res.json({
        "books": result
      });
    }

    db.close();
  } catch (error) {
    res.status(SERVER_ERROR);
    res.type("text").send(SERVER_ERROR_MSG);
  }
});

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
