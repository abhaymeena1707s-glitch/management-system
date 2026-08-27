const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Mock Data
let users = [{ _id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' }];
let books = [];
let categories = [];
let authors = [];
let members = [];
let issues = [];
let returns = [];
let reservations = [];
let fines = [];

// Base Auth Route (Mock)
app.post('/api/auth/login', (req, res) => {
  res.json({ token: 'mock-token', user: users[0] });
});

app.get('/api/auth/me', (req, res) => {
  res.json(users[0]);
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// Authors Mock Routes
app.get('/api/authors', (req, res) => res.json({ data: authors, pagination: { total: authors.length, page: 1, limit: 100 } }));
app.post('/api/authors', (req, res) => {
  const newAuthor = { _id: Date.now().toString(), ...req.body };
  authors.push(newAuthor);
  res.json(newAuthor);
});

// Categories Mock Routes
app.get('/api/categories', (req, res) => res.json({ data: categories, pagination: { total: categories.length, page: 1, limit: 100 } }));
app.post('/api/categories', (req, res) => {
  const newCategory = { _id: Date.now().toString(), ...req.body };
  categories.push(newCategory);
  res.json(newCategory);
});

// Books Mock Routes
app.get('/api/books', (req, res) => res.json({ data: books, pagination: { total: books.length, page: 1, limit: 100 } }));
app.post('/api/books', (req, res) => {
  const newBook = { _id: Date.now().toString(), ...req.body };
  books.push(newBook);
  res.json(newBook);
});

// Members Mock Routes
app.get('/api/members', (req, res) => res.json({ data: members, pagination: { total: members.length, page: 1, limit: 100 } }));
app.post('/api/members', (req, res) => {
  const newMember = { _id: Date.now().toString(), ...req.body };
  members.push(newMember);
  res.json(newMember);
});

// General Fallback Mock Route
app.use('*', (req, res) => {
  console.log(`[Mock Server] Unhandled Request: ${req.method} ${req.originalUrl}`);
  res.status(200).json({ message: 'Mock response', data: [] });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
