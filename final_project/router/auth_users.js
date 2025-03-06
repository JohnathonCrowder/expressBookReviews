const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }
    
    const token = jwt.sign({ username }, "secretKey", { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful.", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }
    
    jwt.verify(token.split(" ")[1], "secretKey", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }
        
        const username = decoded.username;
        const isbn = req.params.isbn;
        const review = req.body.review;
        
        if (!review) {
            return res.status(400).json({ message: "Review content is required." });
        }
        
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found." });
        }
        
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: "Review added/updated successfully.", reviews: books[isbn].reviews });
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }
    
    jwt.verify(token.split(" ")[1], "secretKey", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }
        
        const username = decoded.username;
        const isbn = req.params.isbn;
        
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found." });
        }
        
        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: "No review found from this user for the specified book." });
        }
        
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully.", reviews: books[isbn].reviews });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
