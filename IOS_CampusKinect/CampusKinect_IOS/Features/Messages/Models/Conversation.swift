//
//  Conversation.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - Conversation Model
struct Conversation: Codable, Identifiable, Equatable {
    let id: Int
    let user1Id: Int
    let user2Id: Int
    let lastMessageId: Int?
    let lastMessageAt: Date?
    let createdAt: Date
    let updatedAt: Date
    
    // Related data
    let lastMessage: Message?
    let participants: [ConversationUser]
    let unreadCount: Int
    
    enum CodingKeys: String, CodingKey {
        case id
        case user1Id = "user1_id"
        case user2Id = "user2_id"
        case lastMessageId = "last_message_id"
        case lastMessageAt = "last_message_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case lastMessage = "last_message"
        case participants
        case unreadCount = "unread_count"
    }
    
    // MARK: - Computed Properties
    var timeAgo: String? {
        guard let lastMessageAt = lastMessageAt else { return nil }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: lastMessageAt, relativeTo: Date())
    }
    
    var hasUnreadMessages: Bool {
        return unreadCount > 0
    }
    
    var lastMessagePreview: String {
        guard let lastMessage = lastMessage else {
            return "No messages yet"
        }
        
        switch lastMessage.messageType {
        case .text:
            return lastMessage.content
        case .image:
            return "📷 Image"
        case .system:
            return lastMessage.content
        }
    }
    
    func otherUser(currentUserId: Int) -> ConversationUser? {
        return participants.first { $0.id != currentUserId }
    }
}

// MARK: - Conversation User
struct ConversationUser: Codable, Identifiable, Equatable {
    let id: Int
    let displayName: String
    let profilePicture: String?
    let isOnline: Bool
    let lastSeenAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
        case profilePicture = "profile_picture"
        case isOnline = "is_online"
        case lastSeenAt = "last_seen_at"
    }
    
    var profileImageURL: URL? {
        guard let profilePicture = profilePicture else { return nil }
        return URL(string: "\(APIConstants.baseURL)/\(profilePicture)")
    }
    
    var initials: String {
        let components = displayName.components(separatedBy: " ")
        let firstInitial = components.first?.first?.uppercased() ?? ""
        let lastInitial = components.count > 1 ? components.last?.first?.uppercased() ?? "" : ""
        return "\(firstInitial)\(lastInitial)"
    }
    
    var onlineStatus: String {
        if isOnline {
            return "Online"
        } else if let lastSeenAt = lastSeenAt {
            let formatter = RelativeDateTimeFormatter()
            formatter.unitsStyle = .abbreviated
            return "Last seen \(formatter.localizedString(for: lastSeenAt, relativeTo: Date()))"
        } else {
            return "Offline"
        }
    }
}

// MARK: - Conversations Response
struct ConversationsResponse: Codable {
    let success: Bool
    let conversations: [Conversation]
    let pagination: PaginationInfo
    
    enum CodingKeys: String, CodingKey {
        case success
        case conversations
        case pagination
    }
}

// MARK: - Create Conversation Request
struct CreateConversationRequest: Codable {
    let receiverId: Int
    let initialMessage: String
    
    enum CodingKeys: String, CodingKey {
        case receiverId = "receiver_id"
        case initialMessage = "initial_message"
    }
}

