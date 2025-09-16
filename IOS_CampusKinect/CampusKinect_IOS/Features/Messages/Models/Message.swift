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
    let receiverId: Int
    let content: String
    let messageType: MessageType
    let isRead: Bool
    let createdAt: Date
    let updatedAt: Date
    
    // Optional metadata
    let metadata: MessageMetadata?
    
    enum CodingKeys: String, CodingKey {
        case id
        case conversationId = "conversation_id"
        case senderId = "sender_id"
        case receiverId = "receiver_id"
        case content
        case messageType = "message_type"
        case isRead = "is_read"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case metadata
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

