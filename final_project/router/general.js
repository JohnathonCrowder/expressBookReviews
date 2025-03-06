const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  
  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists." });
  }
  
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop (now with async simulation)
public_users.get('/', async (req, res) => {
  try {
    // Simulate async retrieval of the books data.
    const booksList = await new Promise((resolve) => {
      resolve(books);
    });
    return res.status(200).json({ books: booksList });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN (Synchronous)
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json({ book: books[isbn] });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/async/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    // Suppose we query from our own server:
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    // If the book is not found or server error, handle accordingly
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(500).json({ message: "Error fetching book details" });
  }
});

// Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/isbn/callback/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.status(500).json({ message: "Error fetching book details" });
    });
});
  
// Get book details based on author (Synchronous)
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  const matchingBooks = Object.values(books).filter(book => book.author === author);
  
  if (matchingBooks.length > 0) {
    return res.status(200).json({ books: matchingBooks });
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get book details based on author using async-await with Axios
public_users.get('/author/async/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "No books found for this author" });
    }
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Get book details based on author using Promise callbacks with Axios
public_users.get('/author/callback/:author', (req, res) => {
  const author = req.params.author;
  axios.get(`http://localhost:5000/author/${author}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: "No books found for this author" });
      }
      res.status(500).json({ message: "Error fetching books by author" });
    });
});

// Get all books based on title (Synchronous)
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const matchingBooks = Object.values(books).filter(book => book.title === title);
  
  if (matchingBooks.length > 0) {
    return res.status(200).json({ books: matchingBooks });
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book details based on title using async-await with Axios
public_users.get('/title/async/:title', async (req, res) => {
  try {
    const title = req.params.title;
    // Query our own server:
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "No books found with this title" });
    }
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});

// Get book details based on title using Promise callbacks with Axios
public_users.get('/title/callback/:title', (req, res) => {
  const title = req.params.title;
  axios.get(`http://localhost:5000/title/${title}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: "No books found with this title" });
      }
      res.status(500).json({ message: "Error fetching books by title" });
    });
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
    return res.status(200).json({ reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;
