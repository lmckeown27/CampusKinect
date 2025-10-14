//
//  FeatureFlags.swift
//  CampusKinect_IOS
//
//  Server-driven feature flags
//

import Foundation

class FeatureFlags: ObservableObject {
    static let shared = FeatureFlags()
    
    private var configService = ConfigurationService.shared
    
    private init() {}
    
    // MARK: - Feature Checks
    
    var isMessagingEnabled: Bool {
        configService.features?.messaging.enabled ?? true
    }
    
    var isPostsEnabled: Bool {
        configService.features?.posts.enabled ?? true
    }
    
    var isUserProfileEnabled: Bool {
        configService.features?.userProfile.enabled ?? true
    }
    
    var isNotificationsEnabled: Bool {
        configService.features?.notifications.enabled ?? true
    }
    
    var isSearchEnabled: Bool {
        configService.features?.search.enabled ?? true
    }
    
    var isAdminEnabled: Bool {
        configService.features?.admin.enabled ?? true
    }
    
    var isGuestModeEnabled: Bool {
        configService.features?.guestMode.enabled ?? true
    }
    
    // MARK: - Limits
    
    var maxMessageLength: Int {
        configService.features?.messaging.maxMessageLength ?? 1000
    }
    
    var maxPostLength: Int {
        configService.features?.posts.maxPostLength ?? 5000
    }
    
    var maxImagesPerPost: Int {
        configService.features?.posts.maxImagesPerPost ?? 10
    }
    
    var maxBioLength: Int {
        configService.features?.userProfile.maxBioLength ?? 500
    }
}

// MARK: - SwiftUI Environment
struct FeatureFlagsEnvironmentKey: EnvironmentKey {
    static let defaultValue = FeatureFlags.shared
}

extension EnvironmentValues {
    var featureFlags: FeatureFlags {
        get { self[FeatureFlagsEnvironmentKey.self] }
        set { self[FeatureFlagsEnvironmentKey.self] = newValue }
    }
}

