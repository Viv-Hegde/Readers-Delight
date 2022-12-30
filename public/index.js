"use strict";
(function () {

  const BASE_URL = "/books/";
  window.addEventListener("load", init);

  function init() {
    loadGenres();
  }

  function loadGenres() {
    fetch(BASE_URL + "all_genres")
    .then(statusCheck)
    .then(res => res.json())
    .then(populateGenres)
    .catch(handleErrors);
  }

  function populateGenres(response) {
    id("genres").innerHTML = "";
    let size = response["books"].length;
    for (let i = 0; i < size; i++) {
      let genre = gen("p");
      genre.textContent = response["books"][i]["Genre"];
      id("genres").appendChild(genre);
    }
  }

  function handleErrors(err) {
    console.log(err);
  }

  /**
 * Helper function to return the response's result text if successful, otherwise
 * returns the rejected Promise result with an error status and corresponding text
 * @param {object} res - response to check for success/error
 * @return {object} - valid response if response was successful, otherwise rejected
 *                    Promise result
 */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} DOM object associated with ID.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns all element matching the selector.
   * @param {string} selector - CSS query selector.
   * @returns {array} - an array of DOM objects associated selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * creates and returns a new empty DOM node representing an element of that tagName type
   * @param {string} tagName - HTML element type.
   * @returns {object} - A new DOM object representing an element of that tagName type
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();