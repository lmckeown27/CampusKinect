import Foundation

// MARK: - Report Models
struct PostReport: Codable, Identifiable {
    let id: String
    let postId: String
    let reporterId: String
    let reporterUsername: String
    let reason: ReportReason
    let customReason: String?
    let createdAt: Date
    let status: ReportStatus
    
    // Post details for admin view
    let postContent: String
    let postAuthorId: String
    let postAuthorUsername: String
    let postCreatedAt: Date
}

enum ReportReason: String, CaseIterable, Codable {
    case spam = "spam"
    case harassment = "harassment"
    case hateSpeech = "hate_speech"
    case inappropriateContent = "inappropriate_content"
    case misinformation = "misinformation"
    case violence = "violence"
    case sexualContent = "sexual_content"
    case other = "other"
    
    var displayName: String {
        switch self {
        case .spam:
            return "Spam"
        case .harassment:
            return "Harassment or Bullying"
        case .hateSpeech:
            return "Hate Speech"
        case .inappropriateContent:
            return "Inappropriate Content"
        case .misinformation:
            return "False Information"
        case .violence:
            return "Violence or Threats"
        case .sexualContent:
            return "Sexual Content"
        case .other:
            return "Other"
        }
    }
    
    var description: String {
        switch self {
        case .spam:
            return "Repetitive or unwanted content"
        case .harassment:
            return "Targeting or intimidating behavior"
        case .hateSpeech:
            return "Content that attacks or demeans groups"
        case .inappropriateContent:
            return "Content that violates community standards"
        case .misinformation:
            return "False or misleading information"
        case .violence:
            return "Threats or promotion of violence"
        case .sexualContent:
            return "Sexually explicit material"
        case .other:
            return "Specify your concern in the text field"
        }
    }
}

enum ReportStatus: String, Codable {
    case pending = "pending"
    case reviewed = "reviewed"
    case dismissed = "dismissed"
    case actionTaken = "action_taken"
}

// MARK: - Report Request
struct CreateReportRequest: Codable {
    let postId: String
    let reason: ReportReason
    let customReason: String?
}

// MARK: - Admin Actions
enum AdminAction: String, CaseIterable, Codable {
    case dismiss = "dismiss"
    case removePost = "remove_post"
    case banUser = "ban_user"
    
    var displayName: String {
        switch self {
        case .dismiss:
            return "Dismiss Report"
        case .removePost:
            return "Remove Post"
        case .banUser:
            return "Ban User"
        }
    }
    
    var description: String {
        switch self {
        case .dismiss:
            return "Mark report as reviewed with no action"
        case .removePost:
            return "Remove the reported post from platform"
        case .banUser:
            return "Ban user indefinitely from platform"
        }
    }
    
    var color: String {
        switch self {
        case .dismiss:
            return "gray"
        case .removePost:
            return "orange"
        case .banUser:
            return "red"
        }
    }
}

struct AdminActionRequest: Codable {
    let reportId: String
    let action: AdminAction
    let reason: String?
} 