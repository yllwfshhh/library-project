import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-library-app';
const PORT = 3000;

// Initialize SQLite Database
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}
const db = new Database(path.join(dbDir, 'library.db'));

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS User (
    UserId INTEGER PRIMARY KEY AUTOINCREMENT,
    PhoneNumber TEXT UNIQUE NOT NULL,
    Password TEXT NOT NULL,
    UserName TEXT NOT NULL,
    RegistrationTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLoginTime DATETIME
  );

  CREATE TABLE IF NOT EXISTS Book (
    ISBN TEXT PRIMARY KEY,
    Name TEXT NOT NULL,
    Author TEXT NOT NULL,
    Introduction TEXT
  );

  CREATE TABLE IF NOT EXISTS Inventory (
    InventoryId INTEGER PRIMARY KEY AUTOINCREMENT,
    ISBN TEXT NOT NULL,
    StoreTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status TEXT NOT NULL CHECK(Status IN ('在庫', '出借中', '整理中', '遺失', '損毀', '廢棄')),
    FOREIGN KEY(ISBN) REFERENCES Book(ISBN)
  );

  CREATE TABLE IF NOT EXISTS BorrowingRecord (
    RecordId INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER NOT NULL,
    InventoryId INTEGER NOT NULL,
    BorrowingTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ReturnTime DATETIME,
    FOREIGN KEY(UserId) REFERENCES User(UserId),
    FOREIGN KEY(InventoryId) REFERENCES Inventory(InventoryId)
  );

  CREATE INDEX IF NOT EXISTS idx_borrow_user ON BorrowingRecord(UserId);
  CREATE INDEX IF NOT EXISTS idx_borrow_inventory ON BorrowingRecord(InventoryId);
`);

// Insert initial data if empty
const bookCount = db.prepare('SELECT COUNT(*) as count FROM Book').get() as any;
if (bookCount.count === 0) {
  const insertBook = db.prepare('INSERT INTO Book (ISBN, Name, Author, Introduction) VALUES (?, ?, ?, ?)');
  const insertInventory = db.prepare('INSERT INTO Inventory (ISBN, Status) VALUES (?, ?)');
  
  const books = [
    { isbn: '978-0132350884', name: 'Clean Code', author: 'Robert C. Martin', intro: 'A Handbook of Agile Software Craftsmanship' },
    { isbn: '978-0201616224', name: 'The Pragmatic Programmer', author: 'Andrew Hunt', intro: 'From Journeyman to Master' },
    { isbn: '978-0134685991', name: 'Effective Java', author: 'Joshua Bloch', intro: 'Programming language guide' }
  ];

  db.transaction(() => {
    for (const book of books) {
      insertBook.run(book.isbn, book.name, book.author, book.intro);
      // Add 2 copies of each book to inventory
      insertInventory.run(book.isbn, '在庫');
      insertInventory.run(book.isbn, '在庫');
    }
  })();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { phoneNumber, password, userName } = req.body;
    if (!phoneNumber || !password || !userName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      const stmt = db.prepare('INSERT INTO User (PhoneNumber, Password, UserName) VALUES (?, ?, ?)');
      const info = stmt.run(phoneNumber, hash, userName);

      res.status(201).json({ userId: info.lastInsertRowid, message: 'User registered successfully' });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'Phone number already exists' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare('SELECT * FROM User WHERE PhoneNumber = ?');
    const user = stmt.get(phoneNumber) as any;

    if (!user || !bcrypt.compareSync(password, user.Password)) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Update LastLoginTime
    db.prepare('UPDATE User SET LastLoginTime = CURRENT_TIMESTAMP WHERE UserId = ?').run(user.UserId);

    const token = jwt.sign({ userId: user.UserId, userName: user.UserName }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { userId: user.UserId, userName: user.UserName, phoneNumber: user.PhoneNumber } });
  });

  // User: Get Profile
  app.get('/api/users/me', authenticateToken, (req: any, res) => {
    const stmt = db.prepare('SELECT UserId, PhoneNumber, UserName, RegistrationTime, LastLoginTime FROM User WHERE UserId = ?');
    const user = stmt.get(req.user.userId);
    res.json(user);
  });

  // Books: Get all books
  app.get('/api/books', (req, res) => {
    const stmt = db.prepare('SELECT * FROM Book');
    const books = stmt.all();
    res.json(books);
  });

  // Books: Add a book
  app.post('/api/books', authenticateToken, (req, res) => {
    const { isbn, name, author, introduction } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO Book (ISBN, Name, Author, Introduction) VALUES (?, ?, ?, ?)');
      stmt.run(isbn, name, author, introduction);
      res.status(201).json({ message: 'Book added successfully' });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        res.status(409).json({ error: 'Book with this ISBN already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Inventory: Get inventory
  app.get('/api/inventory', (req, res) => {
    const stmt = db.prepare(`
      SELECT i.InventoryId, i.ISBN, i.StoreTime, i.Status, b.Name, b.Author 
      FROM Inventory i 
      JOIN Book b ON i.ISBN = b.ISBN
    `);
    const inventory = stmt.all();
    res.json(inventory);
  });

  // Inventory: Add to inventory
  app.post('/api/inventory', authenticateToken, (req, res) => {
    const { isbn, status } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO Inventory (ISBN, Status) VALUES (?, ?)');
      const info = stmt.run(isbn, status || '在庫');
      res.status(201).json({ inventoryId: info.lastInsertRowid, message: 'Added to inventory' });
    } catch (error: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Inventory: Update status
  app.put('/api/inventory/:id/status', authenticateToken, (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    try {
      const stmt = db.prepare('UPDATE Inventory SET Status = ? WHERE InventoryId = ?');
      stmt.run(status, id);
      res.json({ message: 'Status updated' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Borrowing: Borrow a book
  app.post('/api/borrow', authenticateToken, (req: any, res) => {
    const { inventoryId } = req.body;
    const userId = req.user.userId;

    const checkStmt = db.prepare('SELECT Status FROM Inventory WHERE InventoryId = ?');
    const item = checkStmt.get(inventoryId) as any;

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    if (item.Status !== '在庫') {
      return res.status(400).json({ error: `Item is not available (Current status: ${item.Status})` });
    }

    const transaction = db.transaction(() => {
      db.prepare('UPDATE Inventory SET Status = ? WHERE InventoryId = ?').run('出借中', inventoryId);
      db.prepare('INSERT INTO BorrowingRecord (UserId, InventoryId) VALUES (?, ?)').run(userId, inventoryId);
    });

    try {
      transaction();
      res.json({ message: 'Book borrowed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to borrow book' });
    }
  });

  // Borrowing: Return a book
  app.post('/api/return', authenticateToken, (req: any, res) => {
    const { inventoryId } = req.body;
    const userId = req.user.userId;

    const recordStmt = db.prepare('SELECT RecordId FROM BorrowingRecord WHERE InventoryId = ? AND UserId = ? AND ReturnTime IS NULL');
    const record = recordStmt.get(inventoryId, userId) as any;

    if (!record) {
      return res.status(400).json({ error: 'No active borrowing record found for this user and item' });
    }

    const transaction = db.transaction(() => {
      db.prepare('UPDATE BorrowingRecord SET ReturnTime = CURRENT_TIMESTAMP WHERE RecordId = ?').run(record.RecordId);
      db.prepare('UPDATE Inventory SET Status = ? WHERE InventoryId = ?').run('整理中', inventoryId);
    });

    try {
      transaction();
      res.json({ message: 'Book returned successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to return book' });
    }
  });

  // Borrowing: Get user records
  app.get('/api/borrowing-records/me', authenticateToken, (req: any, res) => {
    const stmt = db.prepare(`
      SELECT br.RecordId, br.BorrowingTime, br.ReturnTime, i.InventoryId, i.Status, b.Name, b.ISBN
      FROM BorrowingRecord br
      JOIN Inventory i ON br.InventoryId = i.InventoryId
      JOIN Book b ON i.ISBN = b.ISBN
      WHERE br.UserId = ?
      ORDER BY br.BorrowingTime DESC
    `);
    const records = stmt.all(req.user.userId);
    res.json(records);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
