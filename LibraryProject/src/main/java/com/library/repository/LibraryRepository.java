package com.library.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;
import java.util.Map;

@Repository
public class LibraryRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 取得庫存清單 (使用 Parameterized Query 防止 SQL Injection)
    public List<Map<String, Object>> getInventory() {
        String sql = "SELECT i.InventoryId, i.ISBN, i.StoreTime, i.Status, b.Name, b.Author " +
                     "FROM Inventory i JOIN Book b ON i.ISBN = b.ISBN";
        return jdbcTemplate.queryForList(sql);
    }

    // 取得使用者的借閱紀錄
    public List<Map<String, Object>> getUserBorrowingRecords(int userId) {
        String sql = "SELECT br.RecordId, br.BorrowingTime, br.ReturnTime, i.InventoryId, i.Status, b.Name, b.ISBN " +
                     "FROM BorrowingRecord br " +
                     "JOIN Inventory i ON br.InventoryId = i.InventoryId " +
                     "JOIN Book b ON i.ISBN = b.ISBN " +
                     "WHERE br.UserId = ? ORDER BY br.BorrowingTime DESC";
        // 傳入參數 userId 防止 SQL Injection
        return jdbcTemplate.queryForList(sql, userId);
    }

    // 呼叫借書 Stored Procedure
    public Map<String, Object> borrowBookSP(int userId, int inventoryId) {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_borrow_book")
                .declareParameters(
                        new SqlParameter("p_user_id", Types.INTEGER),
                        new SqlParameter("p_inventory_id", Types.INTEGER),
                        new SqlOutParameter("p_success", Types.BOOLEAN),
                        new SqlOutParameter("p_message", Types.VARCHAR)
                );
        return jdbcCall.execute(Map.of("p_user_id", userId, "p_inventory_id", inventoryId));
    }

    // 呼叫還書 Stored Procedure
    public Map<String, Object> returnBookSP(int userId, int inventoryId) {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_return_book")
                .declareParameters(
                        new SqlParameter("p_user_id", Types.INTEGER),
                        new SqlParameter("p_inventory_id", Types.INTEGER),
                        new SqlOutParameter("p_success", Types.BOOLEAN),
                        new SqlOutParameter("p_message", Types.VARCHAR)
                );
        return jdbcCall.execute(Map.of("p_user_id", userId, "p_inventory_id", inventoryId));
    }

    // 註冊使用者
    public Map<String, Object> registerUser(String phoneNumber, String password, String userName) {
        String checkSql = "SELECT COUNT(*) FROM User WHERE PhoneNumber = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, phoneNumber);
        if (count != null && count > 0) {
            return Map.of("success", false, "message", "手機號碼已經被註冊過了");
        }
        
        String sql = "INSERT INTO User (PhoneNumber, Password, UserName) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, phoneNumber, password, userName);
        return Map.of("success", true, "message", "註冊成功");
    }

    // 使用者登入
    public Map<String, Object> loginUser(String phoneNumber, String password) {
        String sql = "SELECT UserId, UserName FROM User WHERE PhoneNumber = ? AND Password = ?";
        List<Map<String, Object>> users = jdbcTemplate.queryForList(sql, phoneNumber, password);
        
        if (users.isEmpty()) {
            return Map.of("success", false, "message", "手機號碼或密碼錯誤");
        }
        
        Map<String, Object> user = users.get(0);
        
        // 更新最後登入時間
        jdbcTemplate.update("UPDATE User SET LastLoginTime = NOW() WHERE UserId = ?", user.get("UserId"));
        
        return Map.of("success", true, "message", "登入成功", "userId", user.get("UserId"), "userName", user.get("UserName"));
    }
}
