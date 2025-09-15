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
    let postId: Int?
    let postTitle: String?
    let postType: String?
    let otherUser: ConversationUser
    let lastMessage: LastMessage
    let lastMessageTime: Date
    let unreadCount: String // Backend returns as string
    let createdAt: Date
    
    // Computed properties
    var unreadCountInt: Int {
        return Int(unreadCount) ?? 0
    }
    
    var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: lastMessageTime, relativeTo: Date())
    }
    
    struct LastMessage: Codable, Equatable {
        let content: String
        let senderId: Int
    }
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
    let username: String
    let firstName: String
    let lastName: String
    let displayName: String
    let profilePicture: String?
    let university: String
    
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
    let data: ConversationsData
    
    struct ConversationsData: Codable {
        let conversations: [Conversation]
        let pagination: PaginationInfo
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

