//
//  Message.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - Message Model
struct Message: Codable, Identifiable, Equatable {
    let id: Int
    let conversationId: Int
    let senderId: Int
    let receiverId: Int?
    let content: String
    let messageType: MessageType
    let isRead: Bool
    let createdAt: Date
    let updatedAt: Date?
    
    // Optional metadata
    let metadata: MessageMetadata?
    
    enum CodingKeys: String, CodingKey {
        case id
        case conversationId
        case senderId
        case receiverId
        case content
        case messageType
        case isRead
        case createdAt
        case updatedAt
        case metadata
    }
    
    // Regular initializer for creating messages in code
    init(id: Int, conversationId: Int, senderId: Int, receiverId: Int? = nil, content: String, messageType: MessageType, isRead: Bool, createdAt: Date, updatedAt: Date? = nil, metadata: MessageMetadata? = nil) {
        self.id = id
        self.conversationId = conversationId
        self.senderId = senderId
        self.receiverId = receiverId
        self.content = content
        self.messageType = messageType
        self.isRead = isRead
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.metadata = metadata
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(Int.self, forKey: .id)
        senderId = try container.decode(Int.self, forKey: .senderId)
        receiverId = try container.decodeIfPresent(Int.self, forKey: .receiverId)
        content = try container.decode(String.self, forKey: .content)
        messageType = try container.decode(MessageType.self, forKey: .messageType)
        isRead = try container.decode(Bool.self, forKey: .isRead)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        updatedAt = try container.decodeIfPresent(Date.self, forKey: .updatedAt)
        metadata = try container.decodeIfPresent(MessageMetadata.self, forKey: .metadata)
        
        // Handle conversationId as either String or Int
        if let conversationIdString = try? container.decode(String.self, forKey: .conversationId) {
            conversationId = Int(conversationIdString) ?? 0
        } else {
            conversationId = try container.decode(Int.self, forKey: .conversationId)
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(id, forKey: .id)
        try container.encode(conversationId, forKey: .conversationId)
        try container.encode(senderId, forKey: .senderId)
        try container.encodeIfPresent(receiverId, forKey: .receiverId)
        try container.encode(content, forKey: .content)
        try container.encode(messageType, forKey: .messageType)
        try container.encode(isRead, forKey: .isRead)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encodeIfPresent(updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(metadata, forKey: .metadata)
    }
    
    // MARK: - Computed Properties
    var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }
    
    var isFromCurrentUser: Bool {
        // This will be determined by comparing with current user ID
        return false // Placeholder - will be set by view model
    }
}

// MARK: - Message Type
enum MessageType: String, Codable, CaseIterable {
    case text = "text"
    case image = "image"
    case system = "system"
    
    var displayName: String {
        switch self {
        case .text:
            return "Text"
        case .image:
            return "Image"
        case .system:
            return "System"
        }
    }
}

// MARK: - Message Metadata
struct MessageMetadata: Codable, Equatable {
    let imageUrl: String?
    let thumbnailUrl: String?
    let systemMessageType: String?
    
    enum CodingKeys: String, CodingKey {
        case imageUrl = "image_url"
        case thumbnailUrl = "thumbnail_url"
        case systemMessageType = "system_message_type"
    }
    
    var fullImageURL: URL? {
        guard let imageUrl = imageUrl else { return nil }
        return URL(string: "\(APIConstants.baseURL)/\(imageUrl)")
    }
    
    var thumbnailImageURL: URL? {
        guard let thumbnailUrl = thumbnailUrl else { return fullImageURL }
        return URL(string: "\(APIConstants.baseURL)/\(thumbnailUrl)")
    }
}

// MARK: - Send Message Request
struct SendMessageRequest: Codable {
    let receiverId: Int
    let content: String
    let messageType: MessageType
    let metadata: MessageMetadata?
    
    enum CodingKeys: String, CodingKey {
        case receiverId = "receiver_id"
        case content
        case messageType = "message_type"
        case metadata
    }
}

// MARK: - Messages Response
struct MessagesResponse: Codable {
    let success: Bool
    let data: MessagesData
    
    struct MessagesData: Codable {
        let messages: [Message]
        let pagination: PaginationInfo
    }
}

