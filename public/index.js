"use strict";
(function () {

  const BASE_URL = "/books/";
  window.addEventListener("load", init);

  function init() {
    loadGenres();
    updateLibrary("All");
    id("logo").addEventListener("click", loadDefault);
    id("search-icon").addEventListener("click", handleSearch);
    id("search-term").addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
    });
    id("cart").addEventListener("click", loadCart);
  }

  function loadCart() {
    toggleViews(false, false, true);
  }

  function handleSearch() {
    let searchTerm = id("search-term").value.trim();
    id("search-term").value = "";
    // console.log(searchTerm.length);
    if (searchTerm.length > 0) {
      //api call here
      fetch(BASE_URL + "search/" + searchTerm)
        .then(statusCheck)
        .then(res => res.json())
        .then(populateBooks)
        .catch(handleErrors);
    }
  }

  function loadDefault() {
    selectDefaultGenre();
    updateLibrary("All");
  }

  function loadGenres() {
    fetch(BASE_URL + "all_genres")
    .then(statusCheck)
    .then(res => res.json())
    .then(populateGenres)
    .catch(handleErrors);
  }

  function selectDefaultGenre() {
    let old = qs(".selected");
    old.classList.remove("selected");
    let all = qs("#genres p");
    all.classList.add("selected");
  }

  function populateGenres(response) {
    id("genres").innerHTML = "";
    let genre = gen("p");
    genre.textContent = "All";
    genre.addEventListener("click", genreClickEvent);
    genre.classList.add("selected");
    genre.classList.add("nav-element");
    id("genres").appendChild(genre);
    let size = response["books"].length;
    for (let i = 0; i < size; i++) {
      genre = gen("p");
      genre.textContent = response["books"][i]["Genre"];
      genre.classList.add("nav-element");
      genre.addEventListener("click", genreClickEvent);
      id("genres").appendChild(genre);
    }
  }

  function genreClickEvent() {
    let old = qs(".selected");
    old.classList.remove("selected");
    let genre = this.textContent;
    this.classList.add("selected");
    updateLibrary(genre);
  }

  function handleErrors(err) {
    console.log(err);
  }

  function updateLibrary(genre) {
    toggleViews(true, false, false);
    fetch(BASE_URL + "genre/" + genre)
    .then(statusCheck)
    .then(res => res.json())
    .then(populateBooks)
    .catch(handleErrors);
  }

  function toggleViews(library, book, cart) {
    let libSec = id("library-view");
    let bookSec = id("current-book-view");
    let cartSec = id("cart-view");
    if (library) {
      libSec.classList.remove("hidden");
    } else {
      libSec.classList.add("hidden");
    }

    if (book) {
      bookSec.classList.remove("hidden");
    } else {
      bookSec.classList.add("hidden");
    }

    if (cart) {
      cartSec.classList.remove("hidden");
    } else {
      cartSec.classList.add("hidden");
    }
  }

  function populateBooks(response) {
    //console.log(response["books"][0]);
    let size = response["books"].length;
    id("library-view").innerHTML = "";
    for (let i = 0; i < size; i++) {
      let author = response["books"][i]["Author"];
      let id_num = response["books"][i]["id"];
      let title = response["books"][i]["Title"];
      let genre = response["books"][i]["Genre"];
      let price = response["books"][i]["Price"];
      let stock = response["books"][i]["Stock"];
      let newDiv = gen("div");
      newDiv.classList.add("book-div");

      let cover = gen("img");
      cover.classList.add("mini-cover");
      cover.src = "/img/"+id_num+".jpg";
      cover.alt = title;
      newDiv.appendChild(cover);

      let bookInfoDiv = genBookInfo(title, author, genre, price);
      newDiv.appendChild(bookInfoDiv);

      let stockInfoDiv = genStockInfo(stock, id_num);
      newDiv.appendChild(stockInfoDiv);

      newDiv.addEventListener("click", () => {
        loadBookInfo(id_num);
      });

      id("library-view").appendChild(newDiv);
    }
  }

  function loadBookInfo(id) {
    // console.log(id);
    toggleViews(false, true, false);
  }

  function genStockInfo(stock, id) {
    let stockDiv = gen("div");
    stockDiv.classList.add("stock-info")
    let stockInfo = gen("p");
    let addToCartButton = gen("button");
    addToCartButton.textContent = "Add to Cart"
    addToCartButton.classList.add("add-to-cart-button");
    if (stock > 0) {
      stockInfo.textContent = "In-Stock";
      addToCartButton.disabled = false;
      // add to cart api call
    } else {
      stockInfo.textContent = "Out-of-Stock";
      addToCartButton.disabled = true;
    }
    stockDiv.appendChild(stockInfo);
    stockDiv.appendChild(addToCartButton);

    return stockDiv;
  }

  function genBookInfo(title, author, genre, price) {
      let bookInfo = gen("div");
      bookInfo.classList.add("book-info");

      let titleText = gen("p");
      titleText.textContent = title;
      titleText.classList.add("book-title");
      bookInfo.appendChild(titleText);

      let AuthorText = gen("p");
      AuthorText.textContent = "Author: " + author;
      bookInfo.appendChild(AuthorText);

      let GenreText = gen("p");
      GenreText.textContent = "Genre: " + genre;
      bookInfo.appendChild(GenreText);

      let PriceText = gen("p");
      PriceText.textContent = "Price: " + price;
      bookInfo.appendChild(PriceText);

      return bookInfo;
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