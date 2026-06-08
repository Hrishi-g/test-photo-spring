package com.practice.firstapp.config;

import java.time.Instant;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import com.practice.firstapp.repo.RefreshTokenRepo;
import com.practice.firstapp.repo.UserRepo;
import com.practice.firstapp.vo.Refresh_token;
import com.practice.firstapp.vo.Users;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;

@Component
public class Utility {

    private RefreshTokenRepo refreshTokenRepo;
    private UserRepo userRepo;

    public Utility(RefreshTokenRepo refreshTokenRepo, UserRepo userRepo) {
        this.refreshTokenRepo = refreshTokenRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public Refresh_token generateRefreshToken(String username) {
        // Find user first
        Users user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if token already exists for this user
        Refresh_token refreshToken = refreshTokenRepo.findByUser(user).orElse(new Refresh_token());

        // Update its value and expiry date
        refreshToken.setToken(java.util.UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusSeconds(7 * 24 * 60 * 60)); // 7 days

        refreshTokenRepo.save(refreshToken);
        return refreshToken;
    }

    public void addJwtCookie(HttpServletResponse response, String jwtToken) {
        ResponseCookie cookie = ResponseCookie.from("jwt_token", jwtToken)
                .path("/")
                .httpOnly(true)
                .secure(false) // Set to true only for HTTPS/AWS
                .sameSite("Lax") // This fixes the cross-site block you saw in the UI
                .maxAge(3600)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void addRefreshCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .path("/")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public Refresh_token validateRefreshToken(Refresh_token token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepo.delete(token);
            throw new RuntimeException("Refresh token expired. Please log in again.");
        }
        return token;
    }

    public void clearCookies(HttpServletResponse response) {
        // We reuse createCleanCookie to avoid repeating code
        response.addHeader(HttpHeaders.SET_COOKIE, createCleanResponseCookie("jwt_token").toString());
        response.addHeader(HttpHeaders.SET_COOKIE, createCleanResponseCookie("refresh_token").toString());
    }

    public ResponseCookie createCleanResponseCookie(String name) {
        return ResponseCookie.from(name, null)
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .maxAge(0)
                .build();
    }

    public Cookie createCleanCookie(String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        // Setting Max-Age to 0 instructs the browser to delete the cookie immediately
        cookie.setMaxAge(0);
        // Secure=true is required if you deploy to AWS or Render with HTTPS
        cookie.setSecure(false);
        return cookie;
    }

    @CachePut(value = "users", key = "#user.id")
    public Users cacheUser(Users user) {
        // Spring handles the storage automatically because of the annotation
        // We just return the user so it can be cached
        return user;
    }

    // Use this in your Logout logic to clear the cache
    @CacheEvict(value = "users", key = "#id")
    public void evictUserFromCache(Long id) {
        // Method body can be empty; the annotation does the work
    }

    // Add your DB deletion call here or in a dedicated TokenService
    public void deleteRefreshTokenFromDb(String token) {
        try {
            // This removes the specific session record from PostgreSQL
            refreshTokenRepo.deleteByToken(token);
            System.out.println("Refresh token successfully removed from DB");
        } catch (Exception e) {
            // Log the error but allow the logout process to continue
            System.err.println("Error deleting token from DB: " + e.getMessage());
        }
    }
}
