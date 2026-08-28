const User = require('../models/User');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Author = require('../models/Author');
const Category = require('../models/Category');
const IssueTransaction = require('../models/IssueTransaction');
const Fine = require('../models/Fine');
const Reservation = require('../models/Reservation');
const Activity = require('../models/Activity');
const Setting = require('../models/Setting');
const { ROLES, ISSUE_STATUS, FINE_STATUS, MEMBER_STATUS, MEMBER_TYPES, ACTIVITY_ACTIONS } = require('../constants');

const seedData = async (options = {}) => {
  const { exitProcess = true, shouldConnect = true } = options;
  try {
    if (shouldConnect) {
      const connectDB = require('../config/db');
      await connectDB();
    }
    console.log('🌱 Starting Database Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Book.deleteMany();
    await Member.deleteMany();
    await Author.deleteMany();
    await Category.deleteMany();
    await IssueTransaction.deleteMany();
    await Fine.deleteMany();
    await Reservation.deleteMany();
    await Activity.deleteMany();
    await Setting.deleteMany();

    console.log('🧹 Existing data wiped cleanly.');

    // 1. Create Default Settings
    const setting = await Setting.create({
      libraryName: 'Library Management System',
      maxBorrowLimit: 5,
      defaultBorrowDays: 7,
      fineRatePerDay: 5,
      currencySymbol: '₹',
      fineBlockingThreshold: 500,
      contactEmail: 'admin@library.com',
      contactPhone: '+91 98765 43210',
    });

    // 2. Create Users
    const adminUser = await User.create({
      name: 'Librarian Admin',
      email: 'admin@library.com',
      password: 'Admin@123',
      role: ROLES.ADMIN,
      phone: '+91 98765 00001',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    });

    const librarianUser = await User.create({
      name: 'Staff Librarian',
      email: 'librarian@library.com',
      password: 'Librarian@123',
      role: ROLES.LIBRARIAN,
      phone: '+91 98765 00002',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    });

    console.log('👤 Created Users (Admin & Librarian)');

    // 3. Create Categories matching Donut Chart
    const fictionCat = await Category.create({ name: 'Fiction', slug: 'fiction', description: 'Fictional novels and stories' });
    const nonFictionCat = await Category.create({ name: 'Non-Fiction', slug: 'non-fiction', description: 'Real stories, history and biographies' });
    const scienceCat = await Category.create({ name: 'Science', slug: 'science', description: 'Scientific journals, physics, chemistry' });
    const techCat = await Category.create({ name: 'Technology', slug: 'technology', description: 'Software engineering, AI, computers' });
    const othersCat = await Category.create({ name: 'Others', slug: 'others', description: 'Miscellaneous and general reading' });

    console.log('🏷️ Created 5 Categories');

    // 4. Create Authors
    const coelho = await Author.create({ name: 'Paulo Coelho', country: 'Brazil', bio: 'Renowned Brazilian lyricist and novelist.' });
    const clear = await Author.create({ name: 'James Clear', country: 'United States', bio: 'Author of the #1 New York Times bestseller Atomic Habits.' });
    const kiyosaki = await Author.create({ name: 'Robert Kiyosaki', country: 'United States', bio: 'American businessman and author of Rich Dad Poor Dad.' });
    const sharma = await Author.create({ name: 'Robin Sharma', country: 'Canada', bio: 'Canadian writer, best known for The Monk Who Sold His Ferrari.' });
    const newport = await Author.create({ name: 'Cal Newport', country: 'United States', bio: 'Computer science professor and author of Deep Work.' });

    console.log('✍️ Created Authors');

    // 5. Create Books (Matching Screenshot)
    const alchemist = await Book.create({
      title: 'The Alchemist',
      isbn: '978-0062315007',
      author: coelho._id,
      category: fictionCat._id,
      description: 'A magical story about following your dreams.',
      publisher: 'HarperOne',
      publicationYear: 1988,
      language: 'English',
      totalCopies: 50,
      availableCopies: 32,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      shelfNumber: 'F-12',
      status: 'Available',
    });

    const richDad = await Book.create({
      title: 'Rich Dad Poor Dad',
      isbn: '978-1612680194',
      author: kiyosaki._id,
      category: nonFictionCat._id,
      description: 'What the rich teach their kids about money.',
      publisher: 'Plata Publishing',
      publicationYear: 1997,
      language: 'English',
      totalCopies: 40,
      availableCopies: 25,
      coverImage: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&q=80&w=400',
      shelfNumber: 'NF-04',
      status: 'Available',
    });

    const atomicHabits = await Book.create({
      title: 'Atomic Habits',
      isbn: '978-0735211292',
      author: clear._id,
      category: nonFictionCat._id,
      description: 'An easy & proven way to build good habits.',
      publisher: 'Avery',
      publicationYear: 2018,
      language: 'English',
      totalCopies: 60,
      availableCopies: 45,
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
      shelfNumber: 'NF-08',
      status: 'Available',
    });

    const fiveAmClub = await Book.create({
      title: 'The 5 AM Club',
      isbn: '978-1443456623',
      author: sharma._id,
      category: othersCat._id,
      description: 'Own your morning. Elevate your life.',
      publisher: 'HarperCollins',
      publicationYear: 2018,
      language: 'English',
      totalCopies: 35,
      availableCopies: 20,
      coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
      shelfNumber: 'OTH-02',
      status: 'Available',
    });

    const deepWork = await Book.create({
      title: 'Deep Work',
      isbn: '978-1455586691',
      author: newport._id,
      category: techCat._id,
      description: 'Rules for focused success in a distracted world.',
      publisher: 'Grand Central Publishing',
      publicationYear: 2016,
      language: 'English',
      totalCopies: 30,
      availableCopies: 18,
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400',
      shelfNumber: 'T-05',
      status: 'Available',
    });

    console.log('📚 Created Sample Books');

    // 6. Create Members (Matching Screenshot)
    const rahul = await Member.create({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      phone: '+91 98765 11111',
      address: 'Bandras, Mumbai',
      membershipId: 'LIB-M-1001',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
      membershipType: MEMBER_TYPES.STUDENT,
      status: MEMBER_STATUS.ACTIVE,
    });

    const sneha = await Member.create({
      name: 'Sneha Patil',
      email: 'sneha.patil@gmail.com',
      phone: '+91 98765 22222',
      address: 'Kothrud, Pune',
      membershipId: 'LIB-M-1002',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
      membershipType: MEMBER_TYPES.FACULTY,
      status: MEMBER_STATUS.ACTIVE,
    });

    const vikram = await Member.create({
      name: 'Vikram Singh',
      email: 'vikram.singh@gmail.com',
      phone: '+91 98765 33333',
      address: 'Indiranagar, Bangalore',
      membershipId: 'LIB-M-1003',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
      membershipType: MEMBER_TYPES.PREMIUM,
      status: MEMBER_STATUS.ACTIVE,
    });

    const pooja = await Member.create({
      name: 'Pooja Mehta',
      email: 'pooja.mehta@gmail.com',
      phone: '+91 98765 44444',
      address: 'Connaught Place, Delhi',
      membershipId: 'LIB-M-1004',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
      membershipType: MEMBER_TYPES.STANDARD,
      status: MEMBER_STATUS.ACTIVE,
    });

    const amit = await Member.create({
      name: 'Amit Kumar',
      email: 'amit.kumar@gmail.com',
      phone: '+91 98765 55555',
      address: 'Salt Lake, Kolkata',
      membershipId: 'LIB-M-1005',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256',
      membershipType: MEMBER_TYPES.STUDENT,
      status: MEMBER_STATUS.ACTIVE,
    });

    const neha = await Member.create({
      name: 'Neha Singh',
      email: 'neha.singh@gmail.com',
      phone: '+91 98765 66666',
      address: 'Cyber City, Gurgaon',
      membershipId: 'LIB-M-1006',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
      membershipType: MEMBER_TYPES.STANDARD,
      status: MEMBER_STATUS.ACTIVE,
    });

    console.log('👥 Created Registered Members');

    // 7. Create Issue Transactions (Matching Screenshot table "Recently Issued Books")
    const issueDateToday = new Date('2024-05-20T10:30:00Z');
    const dueDateToday = new Date('2024-05-27T10:30:00Z');

    const issue1 = await IssueTransaction.create({
      bookId: alchemist._id,
      memberId: rahul._id,
      issuedBy: adminUser._id,
      issueDate: issueDateToday,
      dueDate: dueDateToday,
      status: ISSUE_STATUS.ISSUED,
    });

    const issue2 = await IssueTransaction.create({
      bookId: richDad._id,
      memberId: sneha._id,
      issuedBy: adminUser._id,
      issueDate: issueDateToday,
      dueDate: dueDateToday,
      status: ISSUE_STATUS.ISSUED,
    });

    const issue3 = await IssueTransaction.create({
      bookId: atomicHabits._id,
      memberId: vikram._id,
      issuedBy: adminUser._id,
      issueDate: new Date('2024-05-18T09:45:00Z'),
      dueDate: new Date('2024-05-25T09:45:00Z'),
      status: ISSUE_STATUS.ISSUED,
    });

    const issue4 = await IssueTransaction.create({
      bookId: fiveAmClub._id,
      memberId: pooja._id,
      issuedBy: adminUser._id,
      issueDate: new Date('2024-05-17T11:20:00Z'),
      dueDate: new Date('2024-05-24T11:20:00Z'),
      status: ISSUE_STATUS.ISSUED,
    });

    console.log('🔄 Created Issued Transactions');

    // 8. Create Fines (Matching "Pending Fine ₹12,450" & Recent Activities)
    await Fine.create({
      memberId: neha._id,
      issueTransactionId: issue1._id,
      amount: 150,
      reason: 'Overdue book return fine',
      status: FINE_STATUS.PAID,
      paidAt: new Date('2024-05-19T14:15:00Z'),
      collectedBy: adminUser._id,
    });

    await Fine.create({
      memberId: neha._id,
      issueTransactionId: issue2._id,
      amount: 12450,
      reason: 'Overdue return & damaged cover fine',
      status: FINE_STATUS.PENDING,
    });

    console.log('💰 Created Fine Records');

    // 9. Create Activities (Matching Recent Activities list)
    await Activity.create({
      userId: adminUser._id,
      userName: adminUser.name,
      action: ACTIVITY_ACTIONS.BOOK_ISSUED,
      entity: 'Book',
      entityId: alchemist._id.toString(),
      description: '"The Alchemist" issued to Rahul Sharma',
      createdAt: new Date('2024-05-20T10:30:00Z'),
    });

    await Activity.create({
      userId: adminUser._id,
      userName: adminUser.name,
      action: ACTIVITY_ACTIONS.BOOK_RETURNED,
      entity: 'Book',
      entityId: atomicHabits._id.toString(),
      description: '"Atomic Habits" returned by Priya Verma',
      createdAt: new Date('2024-05-20T09:45:00Z'),
    });

    await Activity.create({
      userId: adminUser._id,
      userName: adminUser.name,
      action: ACTIVITY_ACTIONS.MEMBER_CREATED,
      entity: 'Member',
      entityId: amit._id.toString(),
      description: 'Amit Kumar registered as new member',
      createdAt: new Date('2024-05-19T16:20:00Z'),
    });

    await Activity.create({
      userId: adminUser._id,
      userName: adminUser.name,
      action: ACTIVITY_ACTIONS.FINE_PAID,
      entity: 'Fine',
      entityId: neha._id.toString(),
      description: '₹150 collected from Neha Singh',
      createdAt: new Date('2024-05-19T14:15:00Z'),
    });

    console.log('⚡ Created Activity Log Records');

    console.log('===================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('---------------------------------------------------');
    console.log('🔑 Credentials Created:');
    console.log('   Admin:      admin@library.com / Admin@123');
    console.log('   Librarian:  librarian@library.com / Librarian@123');
    console.log('===================================================');

    if (exitProcess) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    if (exitProcess) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  require('dotenv').config();
  seedData({ exitProcess: true, shouldConnect: true });
}

module.exports = seedData;
