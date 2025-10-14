//
//  AppConfiguration.swift
//  CampusKinect_IOS
//
//  Server-Driven UI Configuration Models
//

import Foundation
import SwiftUI

// MARK: - Main App Configuration
struct AppConfiguration: Codable {
    let version: String
    let minSupportedVersion: String
    let forceUpdate: Bool
    let theme: ThemeConfiguration
    let features: FeatureConfiguration
    let ui: UIConfiguration
    let categories: CategoriesConfiguration
    let text: TextConfiguration
    let api: APIConfiguration
    let links: LinksConfiguration
    let platformOverrides: PlatformOverrides?
    let maintenance: MaintenanceConfiguration
    let announcements: [Announcement]
    let configRefreshInterval: Int
}

// MARK: - Theme Configuration
struct ThemeConfiguration: Codable {
    let colors: ColorConfiguration
    let fonts: FontConfiguration
    let spacing: SpacingConfiguration
    let borderRadius: BorderRadiusConfiguration
}

struct ColorConfiguration: Codable {
    let primary: String
    let primaryDark: String
    let primaryLight: String
    let secondary: String
    let background: String
    let backgroundLight: String
    let backgroundMedium: String
    let text: String
    let textSecondary: String
    let border: String
    let error: String
    let success: String
    let warning: String
    let info: String
    
    // Convert hex strings to SwiftUI Colors
    var primaryColor: Color { Color(hex: primary) ?? .green }
    var primaryDarkColor: Color { Color(hex: primaryDark) ?? .green }
    var primaryLightColor: Color { Color(hex: primaryLight) ?? .green }
    var secondaryColor: Color { Color(hex: secondary) ?? .blue }
    var backgroundColor: Color { Color(hex: background) ?? .black }
    var backgroundLightColor: Color { Color(hex: backgroundLight) ?? .gray }
    var backgroundMediumColor: Color { Color(hex: backgroundMedium) ?? .gray }
    var textColor: Color { Color(hex: text) ?? .white }
    var textSecondaryColor: Color { Color(hex: textSecondary) ?? .gray }
    var borderColor: Color { Color(hex: border) ?? .gray }
    var errorColor: Color { Color(hex: error) ?? .red }
    var successColor: Color { Color(hex: success) ?? .green }
    var warningColor: Color { Color(hex: warning) ?? .orange }
    var infoColor: Color { Color(hex: info) ?? .blue }
}

struct FontConfiguration: Codable {
    let regular: String
    let medium: String
    let semibold: String
    let bold: String
}

struct SpacingConfiguration: Codable {
    let xs: CGFloat
    let sm: CGFloat
    let md: CGFloat
    let lg: CGFloat
    let xl: CGFloat
    let xxl: CGFloat
}

struct BorderRadiusConfiguration: Codable {
    let sm: CGFloat
    let md: CGFloat
    let lg: CGFloat
    let xl: CGFloat
    let full: CGFloat
}

// MARK: - Feature Configuration
struct FeatureConfiguration: Codable {
    let messaging: MessagingFeature
    let posts: PostsFeature
    let userProfile: UserProfileFeature
    let notifications: NotificationsFeature
    let search: SearchFeature
    let admin: AdminFeature
    let guestMode: GuestModeFeature
}

struct MessagingFeature: Codable {
    let enabled: Bool
    let maxMessageLength: Int
    let imageUploadEnabled: Bool
    let maxImagesPerMessage: Int
}

struct PostsFeature: Codable {
    let enabled: Bool
    let maxPostLength: Int
    let maxImagesPerPost: Int
    let categoriesEnabled: Bool
    let tagsEnabled: Bool
}

struct UserProfileFeature: Codable {
    let enabled: Bool
    let allowBioEdit: Bool
    let allowProfilePictureChange: Bool
    let maxBioLength: Int
}

struct NotificationsFeature: Codable {
    let enabled: Bool
    let pushEnabled: Bool
}

struct SearchFeature: Codable {
    let enabled: Bool
    let minSearchLength: Int
    let maxResults: Int
}

struct AdminFeature: Codable {
    let enabled: Bool
    let allowedEmails: [String]
    let allowedUsernames: [String]
}

struct GuestModeFeature: Codable {
    let enabled: Bool
    let allowBrowsing: Bool
    let restrictedFeatures: [String]
}

// MARK: - UI Configuration
struct UIConfiguration: Codable {
    let homeTab: HomeTabConfig
    let createPost: CreatePostConfig
    let messages: MessagesConfig
    let profile: ProfileConfig
    let navigation: NavigationConfig
}

struct HomeTabConfig: Codable {
    let showTopUniversities: Bool
    let defaultPostsPerPage: Int
    let refreshInterval: Int
    let showFilters: Bool
    let availableFilters: [String]
}

struct CreatePostConfig: Codable {
    let showCategoryPicker: Bool
    let showTagsPicker: Bool
    let showLocationField: Bool
    let requireImage: Bool
    let showPreview: Bool
}

struct MessagesConfig: Codable {
    let showTypingIndicator: Bool
    let showReadReceipts: Bool
    let maxConversationsToShow: Int
    let enableImageSharing: Bool
}

struct ProfileConfig: Codable {
    let showStatsCard: Bool
    let showRecentActivity: Bool
    let showSettings: Bool
    let fields: [String]
}

struct NavigationConfig: Codable {
    let showHome: Bool
    let showCreatePost: Bool
    let showMessages: Bool
    let showProfile: Bool
    let bottomNavEnabled: Bool
}

// MARK: - Categories Configuration
struct CategoriesConfiguration: Codable {
    let goodsServices: CategoryGroup
    let events: CategoryGroup
}

struct CategoryGroup: Codable {
    let id: String
    let name: String
    let description: String
    let icon: String
    let subCategories: [String: SubCategory]
}

struct SubCategory: Codable, Identifiable {
    let id: String
    let name: String
    let description: String
    let icon: String
    let tags: [String]
}

// MARK: - Text Configuration
struct TextConfiguration: Codable {
    let appName: String
    let tagline: String
    let homeTabTitle: String
    let createPostButtonText: String
    let messagesTabTitle: String
    let profileTabTitle: String
    let guestModeBannerText: String
    let signInPrompt: String
    let errors: ErrorTextConfiguration
}

struct ErrorTextConfiguration: Codable {
    let networkError: String
    let authError: String
    let genericError: String
}

// MARK: - API Configuration
struct APIConfiguration: Codable {
    let baseURL: String
    let timeout: Int
    let retryAttempts: Int
    let cacheEnabled: Bool
    let cacheDuration: Int
}

// MARK: - Links Configuration
struct LinksConfiguration: Codable {
    let termsOfService: String
    let privacyPolicy: String
    let support: String
    let website: String
}

// MARK: - Platform Overrides
struct PlatformOverrides: Codable {
    let features: FeatureOverrides?
    let ui: UIOverrides?
}

struct FeatureOverrides: Codable {
    let notifications: NotificationsOverride?
}

struct NotificationsOverride: Codable {
    let pushEnabled: Bool?
    let apnsEnabled: Bool?
}

struct UIOverrides: Codable {
    let navigation: NavigationOverride?
}

struct NavigationOverride: Codable {
    let useSFSymbols: Bool?
    let tabBarStyle: String?
}

// MARK: - Maintenance Configuration
struct MaintenanceConfiguration: Codable {
    let enabled: Bool
    let message: String
    let estimatedEndTime: String?
}

// MARK: - Announcement
struct Announcement: Codable, Identifiable {
    let id: String
    let type: String
    let title: String
    let message: String
    let dismissible: Bool
    let priority: Int
}

// MARK: - API Response
struct ConfigurationResponse: Codable {
    let success: Bool
    let data: AppConfiguration
}

// Note: Color hex extension is defined in Color+Extensions.swift

