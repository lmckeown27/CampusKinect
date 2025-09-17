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
    let lastMessage: LastMessage?
    let lastMessageTime: Date?
    let unreadCount: String? // Backend returns as string, optional for new conversations
    let createdAt: Date
    
    // Computed properties
    var unreadCountInt: Int {
        return Int(unreadCount ?? "0") ?? 0
    }
    
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
    
    struct LastMessage: Codable, Equatable {
        let content: String
        let senderId: Int
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
    let university: String?
    
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
    let otherUserId: Int
    let initialMessage: String?
    
    enum CodingKeys: String, CodingKey {
        case otherUserId
        case initialMessage
    }
}





// MARK: - Create Conversation Response
struct CreateConversationResponse: Codable {
    let success: Bool
    let message: String
    let data: CreateConversationData
    
    struct CreateConversationData: Codable {
        let conversation: NewConversation
    }
}

// MARK: - New Conversation (Minimal response from API)
struct NewConversation: Codable, Identifiable {
    let id: Int
    let createdAt: Date
    let otherUser: ConversationUser
    
    // Convert to full Conversation object for UI
    func toConversation() -> Conversation {
        return Conversation(
            id: id,
            postId: nil,
            postTitle: nil,
            postType: nil,
            otherUser: otherUser,
            lastMessage: nil,
            lastMessageTime: nil,
            unreadCount: nil,
            createdAt: createdAt
        )
    }
}

