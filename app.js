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
const { query } = require('express');

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
      res.type("text").send("No books in the database :(");
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

//This endpoint returns all book data related to a specific id
app.get("/books/id/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let db = await getDBConnection();
    let queryText = "SElECT * FROM books WHERE id = ?";

    let result = await db.all(queryText, id);

    if (result.length === 0) {
      res.status(INVALID_PARAM_ERROR);
      res.type("text").send(INVALID_PARAM_ERROR_MSG);
    } else {
      res.json(result);
    }

    db.close();
  } catch (error) {
    res.status(SERVER_ERROR);
    res.type("text").send(SERVER_ERROR_MSG);
  }
});

// this endpoint handles items in cart
// body param true adds it, false removes it
app.post("/books/cart", async (req, res) => {
  try {
    let id = req.body.id;
    let add = req.body.action;
    if (validID(id) && validStatus(add)) {
      // let db = await getDBConnection();
      await updateCart(id,add);
      res.type("text").send("success");
      // db.close();
    } else {
      res.status(INVALID_PARAM_ERROR);
      res.type("text").send(INVALID_PARAM_ERROR_MSG);
    }
  } catch (error) {
    console.log(error);
    res.status(SERVER_ERROR);
    res.type("text").send(SERVER_ERROR_MSG);
  }
});

 async function updateCart(id, status) {
  if (status === "add") {
    // "ADD" scenario, two possibilities
    if (await inCart(id)) {
      // ONE the item already exists, so increment count
      await updateCartCounter(id, true);
    } else {
      // TWO the item is new
      await updateCartEntry(id, true);
    }
  } else { // "REMOVE" scenario,
    // if count = 1 then delete
    if (await getCount(id) === 1) {
      await updateCartEntry(id, false);
    } else {
      // else decrement count
      await updateCartCounter(id, false);
    }
  }
}

// This is a helper function that either inserts or removes an entry from the cart table of the database
// True param inserts while false param removes
async function updateCartEntry(id, param) {
  let db = await getDBConnection();
  let queryText = "SELECT Genre, Title, Author, Price FROM books WHERE id = ?;";
  let result = await db.all(queryText,id);
  let genre = result[0]["Genre"];
  let title = result[0]["Title"];
  let author = result[0]["Author"];
  let price = result[0]["Price"];
  let addQuery = "INSERT INTO cart ('id', 'Genre', 'Title', 'Author', 'Price', 'Count') VALUES (?, ?, ?, ?, ?, 1);";
  let deleteQuery = "DELETE FROM cart WHERE id = ?;";
  if (param) {
    await db.run(addQuery, id, genre , title, author, price);
  } else {
    await db.run(deleteQuery,id);
  }
  db.close();
}

// This is a helper function to increment or decrement the count of the id in cart table
// true param increments, false param decrements
async function updateCartCounter(id, param) {
  let db = await getDBConnection();
  let queryText;
  let part1 = "UPDATE cart SET count = count ";
  let part2 = " 1 WHERE id = ?;";
  if (param) {
    queryText = part1 + "+" + part2;
    await db.run(queryText,id);
  } else {
    queryText = part1 + "-" + part2;
    await db.run(queryText,id);
  }
  db.close();
}

// Function that returns true if a given id exists in the cart table of the database
async function inCart(id) {
  return databaseChecker(id,"cart");
}

// This is a helper function that returns the count of the id in the cart table of the database
async function getCount(id) {
  let db = await getDBConnection();
  let queryText = "SELECT count FROM cart WHERE id	= ?";
  let result = await db.all(queryText, id);
  let retValue = result[0]["Count"];
  db.close();
  // console.log(retValue);
  return retValue;
}

// This is a helper function that checks a "table" in the database if it contains the "id"
async function databaseChecker(id, table) {
  let part1 = "SELECT * FROM ";
  let part2 = " WHERE id = ?;";
  let queryText = part1 + table + part2;
  let result;
  let db = await getDBConnection();
  result = await db.all(queryText, id);
  db.close();
  if (result.length === 0) {
    return false;
  } else {
    return true;
  }
}

// function that returns true if the given id exists in the books table of the database
async function validID(id) {
  return databaseChecker(id,"books");
}

// Helper function that returns true of the parameter is either "add" or "remove"
async function validStatus(param) {
  return (param === "add" || param === "remove");
}

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
