import Foundation

// MARK: - API Configuration
struct APIConstants {
    static let baseURL = "http://192.168.1.205:3000"  // Changed to Mac's IP address for iPhone connection
    static let apiVersion = "v1"
    static let timeout: TimeInterval = 30.0
    
    // Endpoints
    struct Endpoints {
        static let auth = "/auth"
        static let login = "/auth/login"
        static let register = "/auth/register"
        static let verify = "/auth/verify"
        static let resendCode = "/auth/resend-code"
        static let posts = "/posts"
        static let messages = "/messages"
        static let users = "/users"
        static let upload = "/upload"
    }
    
    static var fullBaseURL: String {
        return "\(baseURL)/api/\(apiVersion)"
    }
}

// MARK: - App Configuration
struct AppConstants {
    static let maxImageSize = 50 * 1024 * 1024 // 50MB
    static let maxImagesPerPost = 10
    static let maxPostLength = 2000
    static let minPasswordLength = 6
    
    // Image compression
    static let imageCompressionQuality: CGFloat = 0.8
    static let thumbnailSize = CGSize(width: 300, height: 300)
    
    // Animation durations
    static let shortAnimationDuration: Double = 0.2
    static let mediumAnimationDuration: Double = 0.3
    static let longAnimationDuration: Double = 0.5
}

// MARK: - Keychain Keys
struct KeychainKeys {
    static let accessToken = "campuskinect_access_token"
    static let refreshToken = "campuskinect_refresh_token"
    static let userID = "campuskinect_user_id"
    static let biometricEnabled = "campuskinect_biometric_enabled"
}

// MARK: - UserDefaults Keys
struct UserDefaultsKeys {
    static let hasSeenOnboarding = "has_seen_onboarding"
    static let preferredLanguage = "preferred_language"
    static let notificationsEnabled = "notifications_enabled"
    static let biometricAuthEnabled = "biometric_auth_enabled"
    static let lastSyncDate = "last_sync_date"
}

// MARK: - Notification Names
extension Notification.Name {
    static let userDidLogin = Notification.Name("userDidLogin")
    static let userDidLogout = Notification.Name("userDidLogout")
    static let networkStatusChanged = Notification.Name("networkStatusChanged")
    static let newMessageReceived = Notification.Name("newMessageReceived")
}

