//
//  AppText.swift
//  CampusKinect_IOS
//
//  Server-driven text/copy
//

import Foundation

class AppText: ObservableObject {
    static let shared = AppText()
    
    private var configService = ConfigurationService.shared
    
    private init() {}
    
    // MARK: - App Identity
    
    var appName: String {
        configService.text?.appName ?? "CampusKinect"
    }
    
    var tagline: String {
        configService.text?.tagline ?? "Connect with your campus"
    }
    
    // MARK: - Tab Titles
    
    var homeTabTitle: String {
        configService.text?.homeTabTitle ?? "Home"
    }
    
    var createPostButtonText: String {
        configService.text?.createPostButtonText ?? "Create Post"
    }
    
    var messagesTabTitle: String {
        configService.text?.messagesTabTitle ?? "Messages"
    }
    
    var profileTabTitle: String {
        configService.text?.profileTabTitle ?? "Profile"
    }
    
    // MARK: - Guest Mode
    
    var guestModeBannerText: String {
        configService.text?.guestModeBannerText ?? "Browsing as Guest"
    }
    
    var signInPrompt: String {
        configService.text?.signInPrompt ?? "Sign in to access all features"
    }
    
    // MARK: - Error Messages
    
    var networkError: String {
        configService.text?.errors.networkError ?? "Network connection error. Please try again."
    }
    
    var authError: String {
        configService.text?.errors.authError ?? "Authentication failed. Please sign in again."
    }
    
    var genericError: String {
        configService.text?.errors.genericError ?? "Something went wrong. Please try again."
    }
}

// MARK: - SwiftUI Environment
struct AppTextEnvironmentKey: EnvironmentKey {
    static let defaultValue = AppText.shared
}

extension EnvironmentValues {
    var appText: AppText {
        get { self[AppTextEnvironmentKey.self] }
        set { self[AppTextEnvironmentKey.self] = newValue }
    }
}

