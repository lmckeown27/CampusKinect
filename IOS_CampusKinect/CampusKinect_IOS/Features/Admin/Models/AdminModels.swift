import Foundation

// MARK: - Content Report Models
struct ContentReport: Codable, Identifiable {
    let id: String
    let reporterId: String
    let reportedUserId: String
    let contentId: String
    let contentType: ContentType
    let reason: ReportReason
    let details: String?
    let status: ReportStatus
    let moderatorId: String?
    let moderatorNotes: String?
    let createdAt: String
    let resolvedAt: String?
    
    // Additional user info from API
    let reporterUsername: String?
    let reporterDisplayName: String?
    let reportedUsername: String?
    let reportedDisplayName: String?
    
    enum ContentType: String, Codable, CaseIterable {
        case post = "post"
        case message = "message"
        case user = "user"
        
        var displayName: String {
            switch self {
            case .post: return "Post"
            case .message: return "Message"
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
    let action: ActionType
    let moderatorNotes: String?
    
    enum ActionType: String, Codable {
        case approve = "approve"
        case dismiss = "dismiss"
        
        var displayName: String {
            switch self {
            case .approve: return "Remove Content & Ban User"
            case .dismiss: return "Dismiss Report"
            }
        }
        
        var color: String {
            switch self {
            case .approve: return "red"
            case .dismiss: return "green"
            }
        }
    }
}

// MARK: - API Response Models
struct PaginatedResponse<T: Codable>: Codable {
    let data: [T]
    let pagination: PaginationInfo
}

struct PaginationInfo: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let pages: Int
    
    var hasMore: Bool {
        return page < pages
    }
}

// MARK: - Admin User Verification
struct AdminUser {
    static let authorizedEmail = "lmckeown@calpoly.edu"
    static let authorizedUsername = "liam_mckeown38"
    
    static func isAuthorized(email: String?, username: String?) -> Bool {
        return email == authorizedEmail || username == authorizedUsername
    }
}

// MARK: - Admin Navigation
enum AdminTab: String, CaseIterable {
    case dashboard = "dashboard"
    case reports = "reports"
    case statistics = "statistics"
    
    var displayName: String {
        switch self {
        case .dashboard: return "Dashboard"
        case .reports: return "Reports"
        case .statistics: return "Statistics"
        }
    }
    
    var iconName: String {
        switch self {
        case .dashboard: return "shield"
        case .reports: return "flag"
        case .statistics: return "chart.bar"
        }
    }
} 