//
//  AuthResponse.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - Authentication Response
struct AuthResponse: Codable {
    let success: Bool
    let token: String
    let refreshToken: String?
    let user: User
    let message: String?
    
    enum CodingKeys: String, CodingKey {
        case success
        case token
        case refreshToken = "refresh_token"
        case user
        case message
    }
}

// MARK: - Login Request
struct LoginRequest: Codable {
    let usernameOrEmail: String  // Backend expects "usernameOrEmail", not "email"
    let password: String
}

// MARK: - Register Request
struct RegisterRequest: Codable {
    let username: String
    let email: String
    let password: String
    let firstName: String
    let lastName: String
}

// MARK: - Verification Models
struct VerificationRequest: Codable {
    let email: String
    let code: String
}

struct ResendCodeRequest: Codable {
    let email: String
}

// MARK: - Password Reset Models
struct ForgotPasswordRequest: Codable {
    let email: String
}

struct ResetPasswordRequest: Codable {
    let email: String
    let token: String
    let newPassword: String
    
    enum CodingKeys: String, CodingKey {
        case email
        case token
        case newPassword = "new_password"
    }
}

