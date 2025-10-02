import Foundation

// MARK: - Content Report Models
struct ContentReport: Codable, Identifiable {
    let id: Int
    let reporterId: Int
    let reportedUserId: Int
    let contentId: String
    let contentType: ContentType
    let reason: ReportReason
    let details: String?
    let status: ReportStatus
    let moderatorId: Int?
    let moderatorNotes: String?
    let createdAt: String
    let resolvedAt: String?
    
    // Additional user info from API
    let reporterUsername: String?
    let reporterDisplayName: String?
    let reportedUsername: String?
    let reportedDisplayName: String?
    
    // Content details
    let postTitle: String?
    let postDescription: String?
    let postImageUrl: String?
    let messageContent: String?
    let conversationHistory: [ConversationMessage]?
    let isReporterPostOwner: Bool?
    
    enum CodingKeys: String, CodingKey {
        case id
        case reporterId = "reporter_id"
        case reportedUserId = "reported_user_id"
        case contentId = "content_id"
        case contentType = "content_type"
        case reason
        case details
        case status
        case moderatorId = "moderator_id"
        case moderatorNotes = "moderator_notes"
        case createdAt = "created_at"
        case resolvedAt = "resolved_at"
        case reporterUsername = "reporter_username"
        case reporterDisplayName = "reporter_display_name"
        case reportedUsername = "reported_username"
        case reportedDisplayName = "reported_display_name"
        case postTitle = "post_title"
        case postDescription = "post_description"
        case postImageUrl = "post_image_url"
        case messageContent = "message_content"
        case conversationHistory = "conversation_history"
        case isReporterPostOwner = "is_reporter_post_owner"
    }
    
    // Computed property for full image URL
    var fullPostImageUrl: String? {
        guard let imageUrl = postImageUrl else { return nil }
        if imageUrl.starts(with: "http") {
            return imageUrl
        }
        return "\(APIConstants.baseURL)\(imageUrl)"
    }
    
    struct ConversationMessage: Codable, Identifiable {
        let id: Int
        let senderId: Int
        let content: String?
        let mediaUrl: String?
        let createdAt: String
        let username: String?
        let displayName: String?
        
        enum CodingKeys: String, CodingKey {
            case id
            case senderId = "sender_id"
            case content
            case mediaUrl = "media_url"
            case createdAt = "created_at"
            case username
            case displayName = "display_name"
        }
        
        var fullMediaUrl: String? {
            guard let mediaUrl = mediaUrl else { return nil }
            if mediaUrl.starts(with: "http") {
                return mediaUrl
            }
            return "\(APIConstants.baseURL)\(mediaUrl)"
        }
    }
    
    enum ContentType: String, Codable, CaseIterable {
        case post = "post"
        case message = "message"
        case user = "user"
        
        var displayName: String {
            switch self {
            case .post: return "Post"
            case .message: return "Chat"
            case .user: return "User"
            }
        }
        
        var iconName: String {
            switch self {
            case .post: return "doc.text"
            case .message: return "message"
            case .user: return "person"
            }
        }
    }
    
    enum ReportReason: String, Codable, CaseIterable {
        case harassment = "harassment"
        case hateSpeech = "hate_speech"
        case spam = "spam"
        case inappropriateContent = "inappropriate_content"
        case scam = "scam"
        case violence = "violence"
        case sexualContent = "sexual_content"
        case falseInformation = "false_information"
        case other = "other"
        
        var displayName: String {
            switch self {
            case .harassment: return "Harassment"
            case .hateSpeech: return "Hate Speech"
            case .spam: return "Spam"
            case .inappropriateContent: return "Inappropriate Content"
            case .scam: return "Scam"
            case .violence: return "Violence"
            case .sexualContent: return "Sexual Content"
            case .falseInformation: return "False Information"
            case .other: return "Other"
            }
        }
        
        var color: String {
            switch self {
            case .harassment, .hateSpeech, .violence: return "red"
            case .spam, .scam: return "orange"
            case .inappropriateContent, .sexualContent: return "purple"
            case .falseInformation: return "yellow"
            case .other: return "gray"
            }
        }
    }
    
    enum ReportStatus: String, Codable {
        case pending = "pending"
        case reviewed = "reviewed"
        case resolved = "resolved"
        case dismissed = "dismissed"
        
        var displayName: String {
            switch self {
            case .pending: return "Pending"
            case .reviewed: return "Reviewed"
            case .resolved: return "Resolved"
            case .dismissed: return "Dismissed"
            }
        }
    }
    
    // Computed properties for UI
    var timeRemaining: TimeInterval {
        guard let createdDate = ISO8601DateFormatter().date(from: createdAt) else { return 0 }
        let deadline = createdDate.addingTimeInterval(24 * 60 * 60) // 24 hours
        return deadline.timeIntervalSinceNow
    }
    
    var isUrgent: Bool {
        return timeRemaining <= 4 * 60 * 60 && timeRemaining > 0 // Less than 4 hours
    }
    
    var isOverdue: Bool {
        return timeRemaining <= 0
    }
    
    var timeRemainingText: String {
        if isOverdue {
            return "OVERDUE"
        } else {
            let hours = Int(timeRemaining / 3600)
            return "\(hours)h remaining"
        }
    }
    
    var contentTitle: String {
        switch contentType {
        case .post:
            // Truncate long post content for title display
            if let content = postTitle, !content.isEmpty {
                return content.count > 80 ? String(content.prefix(80)) + "..." : content
            }
            return "Untitled Post"
        case .message:
            return "Message"
        case .user:
            return reportedDisplayName ?? reportedUsername ?? "User Report"
        }
    }
    
    var fullContentDescription: String {
        switch contentType {
        case .post:
            var content = ""
            if let title = postTitle, !title.isEmpty {
                content += "Title: \(title)\n\n"
            }
            if let description = postDescription, !description.isEmpty {
                content += description
            }
            return content.isEmpty ? "No post content available" : content
        case .message:
            return messageContent ?? "No message content available"
        case .user:
            return "Report against user: \(reportedDisplayName ?? reportedUsername ?? "Unknown")"
        }
    }
}

// MARK: - Moderation Statistics
struct ModerationStats: Codable {
    let pendingReports: Int
    let resolvedToday: Int
    let averageResponseTime: Double
    let totalUsers: Int
    let bannedUsers: Int
    
    var averageResponseTimeText: String {
        return String(format: "%.1fh", averageResponseTime)
    }
}

// MARK: - Moderation Action
struct ModerationAction: Codable {
    let action: String
    let moderatorNotes: String?
    let deleteContent: Bool
    let banUser: Bool
    
    init(action: String, moderatorNotes: String?, deleteContent: Bool, banUser: Bool) {
        self.action = action
        self.moderatorNotes = moderatorNotes
        self.deleteContent = deleteContent
        self.banUser = banUser
    }
    
    // Convenience initializers for common actions
    static func deletePostOnly(notes: String = "Content removed for policy violation") -> ModerationAction {
        return ModerationAction(action: "approve", moderatorNotes: notes, deleteContent: true, banUser: false)
    }
    
    static func banUserOnly(notes: String = "User banned for policy violation") -> ModerationAction {
        return ModerationAction(action: "approve", moderatorNotes: notes, deleteContent: false, banUser: true)
    }
    
    static func deleteAndBan(notes: String = "Content removed and user banned") -> ModerationAction {
        return ModerationAction(action: "approve", moderatorNotes: notes, deleteContent: true, banUser: true)
    }
    
    static func dismiss(notes: String = "Report reviewed - no violation found") -> ModerationAction {
        return ModerationAction(action: "dismiss", moderatorNotes: notes, deleteContent: false, banUser: false)
    }
}

// MARK: - API Response Models
// Note: PaginatedResponse and PaginationInfo are defined in Features/Shared/Models/PaginationModel.swift

// MARK: - Admin User Verification
struct AdminUser {
    static let authorizedEmail = "lmckeown@calpoly.edu"
    static let authorizedUsername = "liam_mckeown38"
    
    static func isAuthorized(email: String?, username: String?) -> Bool {
        return email == authorizedEmail || username == authorizedUsername
    }
}

// MARK: - Analytics Data Models
struct AnalyticsData: Codable {
    let totalPosts: Int
    let totalMessages: Int
    let activeUsers: Int
    let newUsersToday: Int
    let postsToday: Int
    let messagesPerDay: Int
    let topUniversities: [UniversityStats]
    let contentTrends: [ContentTrend]
    let reportsByReason: [ReasonStats]
    let userGrowth: [GrowthData]
    
    struct UniversityStats: Codable, Identifiable {
        let id = UUID()
        let name: String
        let userCount: Int
        
        private enum CodingKeys: String, CodingKey {
            case name, userCount
        }
    }
    
    struct ContentTrend: Codable, Identifiable {
        let id = UUID()
        let date: String
        let posts: Int
        let messages: Int
        
        private enum CodingKeys: String, CodingKey {
            case date, posts, messages
        }
    }
    
    struct ReasonStats: Codable, Identifiable {
        let id = UUID()
        let reason: String
        let count: Int
        
        private enum CodingKeys: String, CodingKey {
            case reason, count
        }
    }
    
    struct GrowthData: Codable, Identifiable {
        let id = UUID()
        let date: String
        let users: Int
        
        private enum CodingKeys: String, CodingKey {
            case date, users
        }
    }
}

// MARK: - Banned User Models
struct BannedUser: Codable, Identifiable {
    let id: Int
    let username: String
    let email: String
    let bannedAt: String
    let banReason: String
    let university: String
    let banUntil: String?
    let banType: String?
    
    var bannedDate: Date? {
        return ISO8601DateFormatter().date(from: bannedAt)
    }
    
    var formattedBanDate: String {
        guard let date = bannedDate else { return "Unknown" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
    
    var daysSinceBan: Int {
        guard let date = bannedDate else { return 0 }
        return Calendar.current.dateComponents([.day], from: date, to: Date()).day ?? 0
    }
}

// MARK: - Admin Navigation
enum AdminTab: String, CaseIterable {
    case analytics = "analytics"  // First page
    case reports = "reports"      // Second page
    case users = "users"          // Third page
    
    var displayName: String {
        switch self {
        case .reports: return "Reports"
        case .users: return "Users"
        case .analytics: return "Analytics"
        }
    }
    
    var iconName: String {
        switch self {
        case .reports: return "flag"
        case .users: return "person.2"
        case .analytics: return "chart.bar"
        }
    }
} 