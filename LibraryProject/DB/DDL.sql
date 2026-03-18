SET NAMES utf8mb4;
-- 建立資料庫
CREATE DATABASE IF NOT EXISTS LibraryDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE LibraryDB;

-- 建立 User 表
CREATE TABLE IF NOT EXISTS User (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    PhoneNumber VARCHAR(20) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    UserName VARCHAR(50) NOT NULL,
    RegistrationTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLoginTime DATETIME
);

-- 建立 Book 表
CREATE TABLE IF NOT EXISTS Book (
    ISBN VARCHAR(20) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Author VARCHAR(100) NOT NULL,
    Introduction TEXT
);

-- 建立 Inventory 表 (每本書的多個實體)
CREATE TABLE IF NOT EXISTS Inventory (
    InventoryId INT AUTO_INCREMENT PRIMARY KEY,
    ISBN VARCHAR(20) NOT NULL,
    StoreTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) NOT NULL CHECK(Status IN ('可借閱', '已借閱')),
    FOREIGN KEY (ISBN) REFERENCES Book(ISBN) ON DELETE CASCADE
);

-- 建立 BorrowingRecord 表 (紀錄借還書歷程)
CREATE TABLE IF NOT EXISTS BorrowingRecord (
    RecordId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    InventoryId INT NOT NULL,
    BorrowingTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ReturnTime DATETIME,
    FOREIGN KEY(UserId) REFERENCES User(UserId),
    FOREIGN KEY(InventoryId) REFERENCES Inventory(InventoryId)
);

CREATE INDEX idx_borrow_user ON BorrowingRecord(UserId);
CREATE INDEX idx_borrow_inventory ON BorrowingRecord(InventoryId);

-- ==========================================
-- Stored Procedures (包含 Transaction 處理)
-- ==========================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_borrow_book //

-- 借書 Stored Procedure
CREATE PROCEDURE sp_borrow_book(
    IN p_user_id INT,
    IN p_inventory_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_status VARCHAR(20);
    
    -- 宣告發生 SQL 例外時的處理方式 (Rollback Transaction)
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_message = '資料庫發生錯誤，借閱失敗 (Transaction Rollback)。';
    END;

    -- 開啟交易 (Transaction)
    START TRANSACTION;

    -- 鎖定該筆庫存紀錄以防併發修改 (Pessimistic Locking)
    SELECT Status INTO v_status FROM Inventory WHERE InventoryId = p_inventory_id FOR UPDATE;

    IF v_status = '可借閱' THEN
        -- 1. 更新庫存狀態
        UPDATE Inventory SET Status = '已借閱' WHERE InventoryId = p_inventory_id;
        -- 2. 新增借閱紀錄
        INSERT INTO BorrowingRecord (UserId, InventoryId, BorrowingTime) VALUES (p_user_id, p_inventory_id, NOW());
        
        SET p_success = TRUE;
        SET p_message = '借閱成功！';
        -- 提交交易
        COMMIT;
    ELSE
        SET p_success = FALSE;
        SET p_message = CONCAT('該書籍目前無法借閱，狀態為：', IFNULL(v_status, '找不到該庫存'));
        -- 狀態不符，取消交易
        ROLLBACK;
    END IF;
END //

DROP PROCEDURE IF EXISTS sp_return_book //

-- 還書 Stored Procedure
CREATE PROCEDURE sp_return_book(
    IN p_user_id INT,
    IN p_inventory_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_record_id INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_message = '資料庫發生錯誤，歸還失敗 (Transaction Rollback)。';
    END;

    START TRANSACTION;

    -- 尋找未歸還的借閱紀錄並鎖定
    SELECT RecordId INTO v_record_id FROM BorrowingRecord
    WHERE UserId = p_user_id AND InventoryId = p_inventory_id AND ReturnTime IS NULL
    LIMIT 1 FOR UPDATE;

    IF v_record_id IS NOT NULL THEN
        -- 1. 更新借閱紀錄的歸還時間
        UPDATE BorrowingRecord SET ReturnTime = NOW() WHERE RecordId = v_record_id;
        -- 2. 更新庫存狀態為可借閱
        UPDATE Inventory SET Status = '可借閱' WHERE InventoryId = p_inventory_id;
        
        SET p_success = TRUE;
        SET p_message = '歸還成功！';
        COMMIT;
    ELSE
        SET p_success = FALSE;
        SET p_message = '找不到對應的未歸還紀錄。';
        ROLLBACK;
    END IF;
END //

DELIMITER ;
