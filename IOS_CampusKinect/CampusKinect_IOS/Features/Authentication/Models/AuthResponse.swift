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
    let message: String?
    let data: AuthData
    
    struct AuthData: Codable {
        let user: User
        let tokens: AuthTokens
    }
    
    struct AuthTokens: Codable {
        let accessToken: String
        let refreshToken: String
    }
}

// MARK: - Registration Response (for email verification flow)
struct RegistrationResponse: Codable {
    let success: Bool
    let message: String?
    let data: RegistrationData
    
    struct RegistrationData: Codable {
        let registrationId: String
        let email: String
        let expiresAt: String
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

