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
    let postId: Int
    let postTitle: String
    let postType: String
    
    // OTHER USER INFO (SECONDARY)
    let otherUser: ConversationListUser
    
    // MESSAGE INFO
    let lastMessage: String?
    let lastMessageSenderId: Int?
    let lastMessageTime: Date?
    let unreadCount: Int
    
    enum CodingKeys: String, CodingKey {
        case id
        case createdAt
        case lastMessageAt
        case postId
        case postTitle
        case postType
        case otherUser
        case lastMessage
        case lastMessageSenderId
        case lastMessageTime
        case unreadCount
    }
    
    // MARK: - Custom Decoding
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(Int.self, forKey: .id)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        lastMessageAt = try container.decodeIfPresent(Date.self, forKey: .lastMessageAt)
        postId = try container.decode(Int.self, forKey: .postId)
        postTitle = try container.decode(String.self, forKey: .postTitle)
        postType = try container.decode(String.self, forKey: .postType)
        otherUser = try container.decode(ConversationListUser.self, forKey: .otherUser)
        // Handle lastMessage as either String or Object
        if let lastMessageString = try? container.decode(String.self, forKey: .lastMessage) {
            lastMessage = lastMessageString
            lastMessageSenderId = try container.decodeIfPresent(Int.self, forKey: .lastMessageSenderId)
        } else if let lastMessageObject = try? container.decode(LastMessageObject.self, forKey: .lastMessage) {
            lastMessage = lastMessageObject.content
            lastMessageSenderId = lastMessageObject.senderId
        } else {
            lastMessage = nil
            lastMessageSenderId = try container.decodeIfPresent(Int.self, forKey: .lastMessageSenderId)
        }
        lastMessageTime = try container.decodeIfPresent(Date.self, forKey: .lastMessageTime)
        
        // Handle unreadCount as either String or Int
        if let unreadCountString = try? container.decode(String.self, forKey: .unreadCount) {
            unreadCount = Int(unreadCountString) ?? 0
        } else {
            unreadCount = try container.decode(Int.self, forKey: .unreadCount)
        }
    }
    
    // MARK: - Regular Initializer
    init(
        id: Int,
        createdAt: Date,
        lastMessageAt: Date?,
        postId: Int,
        postTitle: String,
        postType: String,
        otherUser: ConversationListUser,
        lastMessage: String?,
        lastMessageSenderId: Int?,
        lastMessageTime: Date?,
        unreadCount: Int
    ) {
        self.id = id
        self.createdAt = createdAt
        self.lastMessageAt = lastMessageAt
        self.postId = postId
        self.postTitle = postTitle
        self.postType = postType
        self.otherUser = otherUser
        self.lastMessage = lastMessage
        self.lastMessageSenderId = lastMessageSenderId
        self.lastMessageTime = lastMessageTime
        self.unreadCount = unreadCount
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
        return postTitle
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
        case id
        case title
        case description
        case type
        case location
        case expiresAt
        case isFulfilled
        case createdAt
        case author
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
        case firstName
        case lastName
        case displayName
        case profilePicture
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
    
    // MARK: - Conversion to Conversation
    func toConversation() -> Conversation {
        let conversationListUser = ConversationListUser(
            id: otherUser.id,
            university: "Unknown University" // ConversationDetail doesn't include university info
        )
        
        return Conversation(
            id: id,
            createdAt: createdAt,
            lastMessageAt: nil, // New conversation, no messages yet
            postId: post.id,
            postTitle: post.title,
            postType: post.type,
            otherUser: conversationListUser,
            lastMessage: nil, // New conversation, no messages yet
            lastMessageSenderId: nil,
            lastMessageTime: nil,
            unreadCount: 0 // New conversation, no unread messages
        )
    }
}

// MARK: - Conversation List User (Simplified)
struct ConversationListUser: Codable, Equatable {
    let id: Int
    let username: String?
    let firstName: String?
    let lastName: String?
    let displayName: String?
    let profilePicture: String?
    let university: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case firstName
        case lastName
        case displayName
        case profilePicture
        case university
    }
    
    // Computed properties for compatibility
    var initials: String {
        if let displayName = displayName, !displayName.isEmpty {
            return String(displayName.prefix(1))
        }
        return "U\(id)" // Fallback initials
    }
    
    var profileImageURL: URL? {
        return nil // No profile image in list view
    }
}

// MARK: - Helper struct for decoding lastMessage when it comes as an object
struct LastMessageObject: Codable {
    let content: String?
    let senderId: Int?
}

