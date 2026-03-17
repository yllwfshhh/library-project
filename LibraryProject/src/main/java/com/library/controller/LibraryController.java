package com.library.controller;

import com.library.repository.LibraryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // 允許前端 Vue.js 進行跨域請求
public class LibraryController {

    @Autowired
    private LibraryRepository libraryRepository;

    // 取得所有庫存
    @GetMapping("/inventory")
    public List<Map<String, Object>> getInventory() {
        return libraryRepository.getInventory();
    }

    // 取得個人借閱紀錄
    @GetMapping("/borrowing-records/me")
    public List<Map<String, Object>> getMyRecords(@RequestParam int userId) {
        // 實務上 userId 應該從 JWT Token 取得，此處為簡化示範
        return libraryRepository.getUserBorrowingRecords(userId);
    }

    // 借書 API
    @PostMapping("/borrow")
    public Map<String, Object> borrowBook(@RequestBody Map<String, Integer> payload) {
        int userId = payload.get("userId");
        int inventoryId = payload.get("inventoryId");
        return libraryRepository.borrowBookSP(userId, inventoryId);
    }

    // 還書 API
    @PostMapping("/return")
    public Map<String, Object> returnBook(@RequestBody Map<String, Integer> payload) {
        int userId = payload.get("userId");
        int inventoryId = payload.get("inventoryId");
        return libraryRepository.returnBookSP(userId, inventoryId);
    }

    // 註冊 API
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> payload) {
        String phoneNumber = payload.get("phoneNumber");
        String password = payload.get("password");
        String userName = payload.get("userName");
        return libraryRepository.registerUser(phoneNumber, password, userName);
    }

    // 登入 API
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> payload) {
        String phoneNumber = payload.get("phoneNumber");
        String password = payload.get("password");
        return libraryRepository.loginUser(phoneNumber, password);
    }
}
