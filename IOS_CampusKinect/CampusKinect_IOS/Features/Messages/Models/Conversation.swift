//
//  Conversation.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - POST-CENTRIC Conversation Model
struct Conversation: Codable, Identifiable, Equatable {
    let id: Int
    let createdAt: Date
    let lastMessageAt: Date?
    
    // POST CONTEXT (PRIMARY EMPHASIS)
    let post: ConversationPost
    
    // OTHER USER INFO (SECONDARY)
    let otherUser: ConversationUser
    
    // MESSAGE INFO
    let lastMessage: String?
    let lastMessageSenderId: Int?
    let lastMessageTime: Date?
    let unreadCount: Int
    
    enum CodingKeys: String, CodingKey {
        case id = "conversation_id"
        case createdAt = "conversation_created"
        case lastMessageAt = "last_message_at"
        case post
        case otherUser = "other_user"
        case lastMessage = "last_message"
        case lastMessageSenderId = "last_message_sender_id"
        case lastMessageTime = "last_message_time"
        case unreadCount = "unread_count"
    }
    
    // MARK: - Computed Properties
    var timeAgo: String {
        guard let lastMessageTime = lastMessageTime else {
            let formatter = RelativeDateTimeFormatter()
            formatter.unitsStyle = .abbreviated
            return formatter.localizedString(for: createdAt, relativeTo: Date())
        }
        
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: lastMessageTime, relativeTo: Date())
    }
    
    var hasUnreadMessages: Bool {
        return unreadCount > 0
    }
    
    var displayTitle: String {
        return post.title
    }
    
    var displaySubtitle: String {
        if let lastMessage = lastMessage {
            return lastMessage
        } else {
            return "Tap to start messaging about this post"
        }
    }
}

// MARK: - Conversation Post (PRIMARY)
struct ConversationPost: Codable, Equatable {
    let id: Int
    let title: String
    let description: String
    let type: String
    let location: String?
    let expiresAt: Date?
    let isFulfilled: Bool
    let createdAt: Date
    let author: ConversationUser
    
    enum CodingKeys: String, CodingKey {
        case id = "post_id"
        case title = "post_title"
        case description = "post_description"
        case type = "post_type"
        case location = "post_location"
        case expiresAt = "post_expires_at"
        case isFulfilled = "post_is_fulfilled"
        case createdAt = "post_created_at"
        case author = "post_author"
    }
    
    var typeDisplayName: String {
        switch type.lowercased() {
        case "goods": return "Goods"
        case "services": return "Services"
        case "housing": return "Housing"
        case "events": return "Events"
        default: return type.capitalized
        }
    }
    
    var isExpired: Bool {
        guard let expiresAt = expiresAt else { return false }
        return Date() > expiresAt
    }
    
    var statusText: String {
        if isFulfilled {
            return "Fulfilled"
        } else if isExpired {
            return "Expired"
        } else {
            return "Active"
        }
    }
    
    var statusColor: String {
        if isFulfilled {
            return "green"
        } else if isExpired {
            return "gray"
        } else {
            return "blue"
        }
    }
}

// MARK: - Conversation User (SECONDARY)
struct ConversationUser: Codable, Equatable {
    let id: Int
    let username: String
    let firstName: String
    let lastName: String
    let displayName: String
    let profilePicture: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case firstName = "first_name"
        case lastName = "last_name"
        case displayName = "display_name"
        case profilePicture = "profile_picture"
    }
    
    var initials: String {
        let firstInitial = firstName.first?.uppercased() ?? ""
        let lastInitial = lastName.first?.uppercased() ?? ""
        return "\(firstInitial)\(lastInitial)"
    }
    
    var profileImageURL: URL? {
        guard let profilePicture = profilePicture else { return nil }
        return URL(string: "\(APIConstants.baseURL)/\(profilePicture)")
    }
}

// MARK: - Conversations Response
struct ConversationsResponse: Codable {
    let success: Bool
    let data: ConversationsData
    let message: String?
    
    struct ConversationsData: Codable {
        let conversations: [Conversation]
        let pagination: PaginationInfo?
    }
}

// MARK: - Start Conversation Request (POST-CENTRIC)
struct StartConversationRequest: Codable {
    let otherUserId: Int
    let postId: Int // Now required!
    let initialMessage: String?
    
    enum CodingKeys: String, CodingKey {
        case otherUserId = "otherUserId"
        case postId = "postId"
        case initialMessage = "initialMessage"
    }
}

// MARK: - Start Conversation Response
struct StartConversationResponse: Codable {
    let success: Bool
    let message: String
    let data: StartConversationData
    
    struct StartConversationData: Codable {
        let conversation: ConversationDetail
    }
}

// MARK: - Conversation Detail (Full context from API)
struct ConversationDetail: Codable, Identifiable {
    let id: Int
    let createdAt: Date
    let post: ConversationPost
    let otherUser: ConversationUser
    
    enum CodingKeys: String, CodingKey {
        case id
        case createdAt
        case post
        case otherUser
    }
}

