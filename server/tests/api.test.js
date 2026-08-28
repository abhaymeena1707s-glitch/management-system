process.env.NODE_ENV = 'test';

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Author = require('../models/Author');
const Category = require('../models/Category');
const Setting = require('../models/Setting');
const { ROLES } = require('../constants');

describe('Library Management API Test Suite', () => {
  let adminToken = '';
  let librarianToken = '';
  let testBookId = '';
  let testMemberId = '';
  let testCategoryId = '';
  let testAuthorId = '';

  before(async () => {
    await connectDB();
    await User.deleteMany();
    await Book.deleteMany();
    await Member.deleteMany();
    await Category.deleteMany();
    await Author.deleteMany();
    await Setting.deleteMany();

    // Create Initial Setting
    await Setting.create({
      maxBorrowLimit: 5,
      defaultBorrowDays: 7,
      fineRatePerDay: 5,
    });

    // Create Admin User
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin.test@library.com',
      password: 'Password123',
      role: ROLES.ADMIN,
    });

    // Create Librarian User
    const librarian = await User.create({
      name: 'Test Librarian',
      email: 'librarian.test@library.com',
      password: 'Password123',
      role: ROLES.LIBRARIAN,
    });

    // Login Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.test@library.com', password: 'Password123' });
    adminToken = adminRes.body.data.accessToken;

    // Login Librarian
    const libRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'librarian.test@library.com', password: 'Password123' });
    librarianToken = libRes.body.data.accessToken;
  });

  test('GET /health - Health check endpoint', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'UP');
  });

  test('POST /api/auth/login - Valid login returns accessToken & user details', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.test@library.com', password: 'Password123' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.accessToken);
    assert.equal(res.body.data.user.role, ROLES.ADMIN);
  });

  test('POST /api/auth/login - Invalid password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.test@library.com', password: 'WrongPassword' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('GET /api/books - Unauthorized request returns 401', async () => {
    const res = await request(app).get('/api/books');
    assert.equal(res.status, 401);
  });

  test('POST /api/categories - Admin can create Category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Science Fiction', description: 'Sci-Fi books' });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    testCategoryId = res.body.data._id;
  });

  test('POST /api/authors - Admin can create Author', async () => {
    const res = await request(app)
      .post('/api/authors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Isaac Asimov', country: 'United States' });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    testAuthorId = res.body.data._id;
  });

  test('POST /api/books - Create new book with valid payload', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Foundation',
        isbn: '978-0553293357',
        author: testAuthorId,
        category: testCategoryId,
        totalCopies: 5,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.availableCopies, 5);
    testBookId = res.body.data._id;
  });

  test('POST /api/books - Create book with Google Drive cover image object', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Foundation and Empire',
        isbn: '978-0553293364',
        author: testAuthorId,
        category: testCategoryId,
        totalCopies: 3,
        coverImage: {
          type: 'google_drive',
          fileId: '1A2B3C4D5E6F7G8H9I0J1K2L',
          fileName: 'foundation-cover.jpg',
          url: 'https://lh3.googleusercontent.com/d/1A2B3C4D5E6F7G8H9I0J1K2L',
        },
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.coverImage.type, 'google_drive');
    assert.equal(res.body.data.coverImage.fileId, '1A2B3C4D5E6F7G8H9I0J1K2L');
  });

  test('POST /api/books - Reject creation with duplicate ISBN', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Duplicate Foundation',
        isbn: '978-0553293357',
        author: testAuthorId,
        category: testCategoryId,
        totalCopies: 2,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  test('POST /api/members - Create new Member', async () => {
    const res = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1 555-0199',
        membershipType: 'Student',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.membershipId);
    testMemberId = res.body.data._id;
  });

  test('POST /api/issues - Issue book to member', async () => {
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        bookId: testBookId,
        memberId: testMemberId,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'Issued');

    // Check available copies decremented
    const bookRes = await request(app)
      .get(`/api/books/${testBookId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(bookRes.body.data.availableCopies, 4);
  });

  test('GET /api/reports/dashboard - Fetch complete dashboard statistics', async () => {
    const res = await request(app)
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.totalBooks >= 1);
    assert.ok(res.body.data.totalMembers >= 1);
    assert.ok(res.body.data.booksIssued >= 1);
  });
});
