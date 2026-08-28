const { z } = require('zod');

// Auth Validators
const loginSchema = z.object({
  email: z.string().min(1, 'Email or Member ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(5, 'Phone number is required'),
  role: z.enum(['Admin', 'Librarian', 'Member']).optional().default('Member'),
  membershipType: z.enum(['Student', 'Faculty', 'Staff', 'Standard', 'Premium']).optional(),
  department: z.string().optional(),
  course: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Book Validator
const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  isbn: z.string().min(3, 'ISBN must be at least 3 characters'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.number().or(z.string().transform(val => Number(val))).optional(),
  language: z.string().optional(),
  totalCopies: z.number().min(1, 'Total copies must be at least 1').or(z.string().transform(val => Number(val))),
  coverImage: z.union([z.string(), z.record(z.any())]).optional(),
  shelfNumber: z.string().optional(),
});

// Member Validator
const memberSchema = z.object({
  name: z.string().min(1, 'Member name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().optional(),
  membershipType: z.enum(['Student', 'Faculty', 'Staff', 'Standard', 'Premium']).optional(),
  profileImage: z.string().optional(),
  department: z.string().optional(),
  course: z.string().optional(),
  academicYear: z.string().optional(),
  currentYear: z.string().optional(),
  semester: z.string().or(z.number()).optional(),
  rollNumber: z.string().optional(),
  enrollmentNumber: z.string().optional(),
  batch: z.string().optional(),
  graduationYear: z.string().or(z.number()).optional(),
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  joiningYear: z.string().or(z.number()).optional(),
  employmentType: z.string().optional(),
  officeNumber: z.string().optional(),
  staffCategory: z.string().optional(),
  rfidVerified: z.boolean().optional(),
  membershipId: z.string().optional(),
  status: z.string().optional(),
  membershipExpiryDate: z.string().or(z.date()).optional(),
});

// Issue Book Validator
const issueBookSchema = z.object({
  bookId: z.string().min(1, 'Book is required'),
  memberId: z.string().min(1, 'Member is required'),
  dueDate: z.string().optional(),
});

// Return Book Validator
const returnBookSchema = z.object({
  issueTransactionId: z.string().min(1, 'Transaction ID is required'),
});

// Reservation Validator
const reservationSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  memberId: z.string().min(1, 'Member ID is required'),
});

// Fine Action Validator
const payFineSchema = z.object({
  paymentMethod: z.string().optional(),
});

const waiveFineSchema = z.object({
  reason: z.string().min(1, 'Reason for waiving is required'),
});

module.exports = {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  bookSchema,
  memberSchema,
  issueBookSchema,
  returnBookSchema,
  reservationSchema,
  payFineSchema,
  waiveFineSchema,
};
