USE LibraryDB;

-- 插入測試書籍
INSERT IGNORE INTO Book (ISBN, Name, Author, Introduction) VALUES 
('978-0132350884', 'Clean Code', 'Robert C. Martin', 'A Handbook of Agile Software Craftsmanship'),
('978-0201616224', 'The Pragmatic Programmer', 'Andrew Hunt', 'From Journeyman to Master'),
('978-0134685991', 'Effective Java', 'Joshua Bloch', 'Programming language guide'),
('978-0747532743', 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'The boy who lived starts his magical journey at Hogwarts.'),
('978-0747538486', 'Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 'A mysterious chamber is opened, and ancient secrets are revealed.'),
('978-0747542155', 'Harry Potter and the Prisoner of Azkaban', 'J.K. Rowling', 'An escaped prisoner is on the loose, and the past comes back to haunt Harry.');

-- 插入測試庫存 (每本書兩本)
INSERT INTO Inventory (ISBN, Status) VALUES 
('978-0132350884', '可借閱'),
('978-0132350884', '可借閱'),
('978-0201616224', '可借閱'),
('978-0201616224', '可借閱'),
('978-0134685991', '可借閱'),
('978-0134685991', '可借閱'),
('978-0747532743', '可借閱'),
('978-0747538486', '可借閱'),
('978-0747542155', '可借閱');

-- 插入測試使用者 (密碼需透過應用程式 bcrypt 加密，此處僅為示意)
INSERT IGNORE INTO User (PhoneNumber, Password, UserName) VALUES 
('0912345678', '$2a$10$xyz123...', 'Test User');
