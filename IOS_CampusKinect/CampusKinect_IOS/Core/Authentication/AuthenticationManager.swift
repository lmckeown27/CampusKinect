//
//  AuthenticationManager.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation
import Combine

// MARK: - Authentication Manager
@MainActor
class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var currentUser: User?
    @Published var authError: APIError?
    
    private let apiService = APIService.shared
    private let keychainManager = KeychainManager.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Listen for authentication notifications
        NotificationCenter.default.publisher(for: .userDidLogin)
            .sink { [weak self] _ in
                Task { @MainActor in
                    self?.isAuthenticated = true
                }
            }
            .store(in: &cancellables)
        
        NotificationCenter.default.publisher(for: .userDidLogout)
            .sink { [weak self] _ in
                Task { @MainActor in
                    self?.isAuthenticated = false
                    self?.currentUser = nil
                }
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Authentication State Check
    func checkExistingAuth() async {
        isLoading = true
        
        do {
            // Check if we have a valid token
            if let _ = await keychainManager.getAccessToken() {
                // Try to get current user to validate token
                let user = try await apiService.getCurrentUser()
                currentUser = user
                isAuthenticated = true
                
                NotificationCenter.default.post(name: .userDidLogin, object: nil)
            }
        } catch {
            // Token is invalid or expired, clear it
            await logout()
        }
        
        isLoading = false
    }
    
    // MARK: - Login
    func login(email: String, password: String) async -> Bool {
        isLoading = true
        authError = nil
        
        do {
            let response = try await apiService.login(email: email, password: password)
            
            // Save tokens
            await keychainManager.saveAccessToken(response.token)
            if let refreshToken = response.refreshToken {
                await keychainManager.saveRefreshToken(refreshToken)
            }
            await keychainManager.saveUserID(String(response.user.id))
            
            // Update state
            currentUser = response.user
            isAuthenticated = true
            
            NotificationCenter.default.post(name: .userDidLogin, object: nil)
            
            isLoading = false
            return true
            
        } catch let error as APIError {
            authError = error
            isLoading = false
            return false
        } catch {
            authError = .networkError(error.localizedDescription)
            isLoading = false
            return false
        }
    }
    
    // MARK: - Register
    func register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        displayName: String
    ) async -> Bool {
        isLoading = true
        authError = nil
        
        do {
            let response = try await apiService.register(
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                displayName: displayName
            )
            
            // For registration, we might need email verification
            // So we don't automatically log in the user
            currentUser = response.user
            
            isLoading = false
            return true
            
        } catch let error as APIError {
            authError = error
            isLoading = false
            return false
        } catch {
            authError = .networkError(error.localizedDescription)
            isLoading = false
            return false
        }
    }
    
    // MARK: - Email Verification
    func verifyEmail(email: String, code: String) async -> Bool {
        isLoading = true
        authError = nil
        
        do {
            let response = try await apiService.verifyEmail(email: email, code: code)
            
            // Save tokens after successful verification
            await keychainManager.saveAccessToken(response.token)
            if let refreshToken = response.refreshToken {
                await keychainManager.saveRefreshToken(refreshToken)
            }
            await keychainManager.saveUserID(String(response.user.id))
            
            // Update state
            currentUser = response.user
            isAuthenticated = true
            
            NotificationCenter.default.post(name: .userDidLogin, object: nil)
            
            isLoading = false
            return true
            
        } catch let error as APIError {
            authError = error
            isLoading = false
            return false
        } catch {
            authError = .networkError(error.localizedDescription)
            isLoading = false
            return false
        }
    }
    
    // MARK: - Resend Verification Code
    func resendVerificationCode(email: String) async -> Bool {
        isLoading = true
        authError = nil
        
        do {
            _ = try await apiService.resendVerificationCode(email: email)
            isLoading = false
            return true
            
        } catch let error as APIError {
            authError = error
            isLoading = false
            return false
        } catch {
            authError = .networkError(error.localizedDescription)
            isLoading = false
            return false
        }
    }
    
    // MARK: - Logout
    func logout() async {
        isLoading = true
        
        // Clear tokens from keychain
        await keychainManager.clearAllTokens()
        
        // Clear state
        isAuthenticated = false
        currentUser = nil
        authError = nil
        
        NotificationCenter.default.post(name: .userDidLogout, object: nil)
        
        isLoading = false
    }
    
    // MARK: - Update Profile
    func updateProfile(_ profile: UpdateProfileRequest) async -> Bool {
        isLoading = true
        authError = nil
        
        do {
            let updatedUser = try await apiService.updateProfile(profile)
            currentUser = updatedUser
            
            isLoading = false
            return true
            
        } catch let error as APIError {
            authError = error
            isLoading = false
            return false
        } catch {
            authError = .networkError(error.localizedDescription)
            isLoading = false
            return false
        }
    }
    
    // MARK: - Clear Error
    func clearError() {
        authError = nil
    }
}

