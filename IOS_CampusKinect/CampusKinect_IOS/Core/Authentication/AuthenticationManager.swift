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
    static let shared = AuthenticationManager()
    
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var currentUser: User?
    @Published var authError: APIError?
    
    // Guest Mode
    @Published var isGuest = false
    @Published var guestUniversityId: Int?
    @Published var guestUniversityName: String?
    
    private let apiService = APIService.shared
    let keychainManager = KeychainManager.shared
    private var cancellables = Set<AnyCancellable>()
    
    private let guestStateKey = "campuskinect_guest_state"
    
    init() {
        // Load guest state from UserDefaults
        loadGuestState()
        
        // Listen for authentication notifications
        NotificationCenter.default.publisher(for: .userDidLogin)
            .sink { [weak self] _ in
                Task { @MainActor in
                    self?.isAuthenticated = true
                    self?.exitGuestMode() // Exit guest mode when logging in
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
        
        // Check if we have both a valid token and stored user ID
        if let _ = await keychainManager.getAccessToken(),
           let userIdString = await keychainManager.getUserID(),
           let _ = Int(userIdString) {
            
            // We have valid credentials, try to get user details
            do {
                let user = try await apiService.getCurrentUser()
                currentUser = user
                isAuthenticated = true
                
                NotificationCenter.default.post(name: .userDidLogin, object: nil)
            } catch let error as APIError {
                // Only logout on actual authentication failures, not network errors
                switch error {
                case .unauthorized, .accountBanned:
                    // Token is invalid or account is banned - logout required
                    print("Authentication failed with invalid token: \(error)")
                    await logout()
                default:
                    // Network error or other temporary issue - keep user logged in
                    // They can try again when network is restored
                    print("Failed to fetch user details but keeping session: \(error)")
                    // Set authenticated to false but don't clear tokens
                    isAuthenticated = false
                }
            } catch {
                // Unknown error - keep session but mark as not authenticated temporarily
                print("Unknown error fetching user details, keeping session: \(error)")
                isAuthenticated = false
            }
        } else {
            // No valid credentials found - show guest mode
            isAuthenticated = false
        }
        
        isLoading = false
    }
    
    // MARK: - Login
    func login(email: String, password: String) async -> Bool {
        isLoading = true
        authError = nil
        
        do {
            print("🔐 AuthenticationManager: Starting login process...")
            let response = try await apiService.login(email: email, password: password)
            print("🔐 AuthenticationManager: Login API call successful")
            
            // Save tokens with error handling
            print("🔐 AuthenticationManager: Saving access token...")
            let tokenSaved = await keychainManager.saveAccessToken(response.data.tokens.accessToken)
            guard tokenSaved else {
                print("❌ AuthenticationManager: Failed to save access token")
                authError = .keychainError
                isLoading = false
                return false
            }
            print("✅ AuthenticationManager: Access token saved")
            
            print("🔐 AuthenticationManager: Saving refresh token...")
            let refreshTokenSaved = await keychainManager.saveRefreshToken(response.data.tokens.refreshToken)
            guard refreshTokenSaved else {
                print("❌ AuthenticationManager: Failed to save refresh token")
                authError = .keychainError
                isLoading = false
                return false
            }
            print("✅ AuthenticationManager: Refresh token saved")
            
            print("🔐 AuthenticationManager: Saving user ID...")
            let userIDSaved = await keychainManager.saveUserID(String(response.data.user.id))
            guard userIDSaved else {
                print("❌ AuthenticationManager: Failed to save user ID")
                authError = .keychainError
                isLoading = false
                return false
            }
            print("✅ AuthenticationManager: User ID saved")
            
            // Update state
            print("🔐 AuthenticationManager: Updating authentication state...")
            currentUser = response.data.user
            isAuthenticated = true
            print("✅ AuthenticationManager: Authentication state updated")
            
            // Fetch complete user profile including email
            print("🔐 AuthenticationManager: Refreshing user profile...")
            await refreshCurrentUser()
            print("✅ AuthenticationManager: User profile refreshed")
            
            // Check if this is first login and request push notification permissions
            print("🔔 AuthenticationManager: Checking notification permission status...")
            Task {
                await PushNotificationManager.shared.checkAndRequestPermissionIfNeeded()
            }
            
            print("🔐 AuthenticationManager: Posting login notification...")
            NotificationCenter.default.post(name: .userDidLogin, object: nil)
            
            print("🔐 AuthenticationManager: Login process completed successfully")
            isLoading = false
            return true
            
        } catch let error as APIError {
            print("❌ AuthenticationManager: Login failed with API error: \(error)")
            authError = error
            isLoading = false
            return false
        } catch {
            print("❌ AuthenticationManager: Login failed with unknown error: \(error)")
            authError = .networkError(error.localizedDescription)
            isLoading = false
            return false
        }
    }
    
    // MARK: - Register
    func register(
        username: String,
        email: String,
        password: String,
        firstName: String,
        lastName: String
    ) async -> Bool {
        isLoading = true
        authError = nil
        
        do {
            let response = try await apiService.register(
                username: username,
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName
            )
            
            // Registration successful - user needs to verify email
            // Don't set currentUser yet, wait for email verification
            print("Registration successful. Registration ID: \(response.data.registrationId)")
            
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
            
            // Save tokens after successful verification with error handling
            let tokenSaved = await keychainManager.saveAccessToken(response.data.tokens.accessToken)
            guard tokenSaved else {
                authError = .keychainError
                isLoading = false
                return false
            }
            
            let refreshTokenSaved = await keychainManager.saveRefreshToken(response.data.tokens.refreshToken)
            guard refreshTokenSaved else {
                authError = .keychainError
                isLoading = false
                return false
            }
            
            let userIDSaved = await keychainManager.saveUserID(String(response.data.user.id))
            guard userIDSaved else {
                authError = .keychainError
                isLoading = false
                return false
            }
            
            // Update state
            currentUser = response.data.user
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
        
        // Save current guest university if exists (to preserve selection)
        let savedUniversityId = guestUniversityId
        let savedUniversityName = guestUniversityName
        
        // Clear tokens from keychain
        let tokensCleared = await keychainManager.clearAllTokens()
        if !tokensCleared {
            // Log warning but continue with logout since we want to clear local state anyway
            print("Warning: Failed to clear tokens from keychain")
        }
        
        // Clear authentication state
        isAuthenticated = false
        currentUser = nil
        authError = nil
        
        // Enter guest mode with preserved university or current user's university
        if let universityId = savedUniversityId, let universityName = savedUniversityName {
            // Restore previous guest university selection
            enterGuestMode(universityId: universityId, universityName: universityName)
            print("👤 Logout: Re-entered guest mode with saved university: \(universityName)")
        } else {
            // Try to use current user's university before logout
            // If no university available, user will see university selector
            isGuest = false
            guestUniversityId = nil
            guestUniversityName = nil
            saveGuestState()
            print("👤 Logout: No guest university - will show selector")
        }
        
        NotificationCenter.default.post(name: .userDidLogout, object: nil)
        
        // Small delay to ensure all UI updates and notifications complete
        try? await Task.sleep(nanoseconds: 200_000_000) // 0.2 seconds
        isLoading = false
    }
    
    // MARK: - Update Profile
    func updateProfile(_ profile: UpdateProfileRequest) async -> Bool {
        isLoading = true
        authError = nil
        
        do {
            guard let currentUser = currentUser else {
                authError = APIError.decodingError("No current user available")
                isLoading = false
                return false
            }
            
            let updatedUser = try await apiService.updateProfile(profile, currentUser: currentUser)
            self.currentUser = updatedUser
            
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
    
    // MARK: - Update Current User
    func updateCurrentUser(_ user: User) async {
        await MainActor.run {
            self.currentUser = user
        }
    }
    
    // MARK: - Refresh Current User
    func refreshCurrentUser() async {
        do {
            let user = try await apiService.getCurrentUser()
            await MainActor.run {
                self.currentUser = user
            }
        } catch {
            print("Failed to refresh current user: \(error)")
        }
    }
    
    // MARK: - Guest Mode
    func enterGuestMode(universityId: Int, universityName: String) {
        print("👤 AuthManager.enterGuestMode() called with ID: \(universityId), Name: \(universityName)")
        isGuest = true
        guestUniversityId = universityId
        guestUniversityName = universityName
        saveGuestState()
        print("👤 AuthManager: Guest state saved. isGuest=\(isGuest), ID=\(guestUniversityId?.description ?? "nil")")
    }
    
    func exitGuestMode() {
        isGuest = false
        guestUniversityId = nil
        guestUniversityName = nil
        saveGuestState()
    }
    
    private func loadGuestState() {
        if let data = UserDefaults.standard.data(forKey: guestStateKey),
           let state = try? JSONDecoder().decode(GuestState.self, from: data) {
            isGuest = state.isGuest
            guestUniversityId = state.universityId
            guestUniversityName = state.universityName
            print("👤 AuthManager.loadGuestState(): Loaded guest state - isGuest=\(isGuest), ID=\(guestUniversityId?.description ?? "nil"), Name=\(guestUniversityName ?? "nil")")
        } else {
            print("👤 AuthManager.loadGuestState(): No guest state found in UserDefaults")
        }
    }
    
    private func saveGuestState() {
        let state = GuestState(
            isGuest: isGuest,
            universityId: guestUniversityId,
            universityName: guestUniversityName
        )
        if let data = try? JSONEncoder().encode(state) {
            UserDefaults.standard.set(data, forKey: guestStateKey)
        }
    }
    
    // MARK: - Clear Error
    func clearError() {
        authError = nil
    }
}

// MARK: - Guest State
private struct GuestState: Codable {
    let isGuest: Bool
    let universityId: Int?
    let universityName: String?
}

