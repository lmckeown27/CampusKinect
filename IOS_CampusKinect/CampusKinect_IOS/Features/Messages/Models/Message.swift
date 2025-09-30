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
    let mediaUrl: String? // For image/file messages
    let isRead: Bool
    let createdAt: Date
    let updatedAt: Date?
    
    // Sender information
    let senderUsername: String?
    let senderFirstName: String?
    let senderLastName: String?
    let senderDisplayName: String?
    let senderProfilePicture: String?
    
    // Optional metadata
    let metadata: MessageMetadata?
    
    enum CodingKeys: String, CodingKey {
        case id
        case conversationId
        case senderId
        case receiverId
        case content
        case messageType
        case mediaUrl
        case isRead
        case createdAt
        case updatedAt
        case sender // For nested sender object
        case senderUsername = "username"
        case senderFirstName = "first_name"
        case senderLastName = "last_name"
        case senderDisplayName = "display_name"
        case senderProfilePicture = "profile_picture"
        case metadata
    }
    
    // Regular initializer for creating messages in code
    init(id: Int, conversationId: Int, senderId: Int, receiverId: Int? = nil, content: String, messageType: MessageType, mediaUrl: String? = nil, isRead: Bool, createdAt: Date, updatedAt: Date? = nil, senderUsername: String? = nil, senderFirstName: String? = nil, senderLastName: String? = nil, senderDisplayName: String? = nil, senderProfilePicture: String? = nil, metadata: MessageMetadata? = nil) {
        self.id = id
        self.conversationId = conversationId
        self.senderId = senderId
        self.receiverId = receiverId
        self.content = content
        self.messageType = messageType
        self.mediaUrl = mediaUrl
        self.isRead = isRead
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.senderUsername = senderUsername
        self.senderFirstName = senderFirstName
        self.senderLastName = senderLastName
        self.senderDisplayName = senderDisplayName
        self.senderProfilePicture = senderProfilePicture
        self.metadata = metadata
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(Int.self, forKey: .id)
        senderId = try container.decode(Int.self, forKey: .senderId)
        receiverId = try container.decodeIfPresent(Int.self, forKey: .receiverId)
        content = try container.decode(String.self, forKey: .content)
        messageType = try container.decode(MessageType.self, forKey: .messageType)
        mediaUrl = try container.decodeIfPresent(String.self, forKey: .mediaUrl)
        isRead = try container.decode(Bool.self, forKey: .isRead)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        updatedAt = try container.decodeIfPresent(Date.self, forKey: .updatedAt)
        
        // Try to decode sender information from nested "sender" object first (new API format)
        if let senderInfo = try? container.decodeIfPresent(SenderInfo.self, forKey: CodingKeys.sender) {
            senderUsername = senderInfo.username
            senderFirstName = senderInfo.firstName
            senderLastName = senderInfo.lastName
            senderDisplayName = senderInfo.displayName
            senderProfilePicture = senderInfo.profilePicture
        } else {
            // Fallback to root-level fields (old API format)
            senderUsername = try container.decodeIfPresent(String.self, forKey: .senderUsername)
            senderFirstName = try container.decodeIfPresent(String.self, forKey: .senderFirstName)
            senderLastName = try container.decodeIfPresent(String.self, forKey: .senderLastName)
            senderDisplayName = try container.decodeIfPresent(String.self, forKey: .senderDisplayName)
            senderProfilePicture = try container.decodeIfPresent(String.self, forKey: .senderProfilePicture)
        }
        
        metadata = try container.decodeIfPresent(MessageMetadata.self, forKey: .metadata)
        
        // Handle conversationId as either String or Int
        if let conversationIdString = try? container.decode(String.self, forKey: .conversationId) {
            conversationId = Int(conversationIdString) ?? 0
        } else {
            conversationId = try container.decode(Int.self, forKey: .conversationId)
        }
    }
    
    // Helper struct to decode nested sender object
    private struct SenderInfo: Codable {
        let username: String?
        let firstName: String?
        let lastName: String?
        let displayName: String?
        let profilePicture: String?
        
        enum CodingKeys: String, CodingKey {
            case username
            case firstName
            case lastName
            case displayName
            case profilePicture
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
        try container.encodeIfPresent(mediaUrl, forKey: .mediaUrl)
        try container.encode(isRead, forKey: .isRead)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encodeIfPresent(updatedAt, forKey: .updatedAt)
        
        // Encode sender information
        try container.encodeIfPresent(senderUsername, forKey: .senderUsername)
        try container.encodeIfPresent(senderFirstName, forKey: .senderFirstName)
        try container.encodeIfPresent(senderLastName, forKey: .senderLastName)
        try container.encodeIfPresent(senderDisplayName, forKey: .senderDisplayName)
        try container.encodeIfPresent(senderProfilePicture, forKey: .senderProfilePicture)
        
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
        
        // Check if imageUrl is already a full URL
        if imageUrl.starts(with: "http://") || imageUrl.starts(with: "https://") {
            return URL(string: imageUrl)
        }
        
        // Otherwise, prepend the base URL
        let cleanImageUrl = imageUrl.hasPrefix("/") ? imageUrl : "/\(imageUrl)"
        return URL(string: "\(APIConstants.baseURL)\(cleanImageUrl)")
    }
    
    var thumbnailImageURL: URL? {
        guard let thumbnailUrl = thumbnailUrl else { return fullImageURL }
        
        // Check if thumbnailUrl is already a full URL
        if thumbnailUrl.starts(with: "http://") || thumbnailUrl.starts(with: "https://") {
            return URL(string: thumbnailUrl)
        }
        
        // Otherwise, prepend the base URL
        let cleanThumbnailUrl = thumbnailUrl.hasPrefix("/") ? thumbnailUrl : "/\(thumbnailUrl)"
        return URL(string: "\(APIConstants.baseURL)\(cleanThumbnailUrl)")
    }
}

// MARK: - Conversation Image Upload Response
struct ConversationImageUploadResponse: Codable {
    let success: Bool
    let message: String?
    let data: ConversationImageData?
}

struct ConversationImageData: Codable {
    let image: ImageInfo
    let message: ConversationMessageResponse
}

struct ImageInfo: Codable {
    let url: String
    let thumbnailUrl: String?
}

struct ConversationMessageResponse: Codable {
    let id: Int
    let conversationId: Int
    let senderId: Int
    let receiverId: Int?
    let content: String
    let messageType: String
    let mediaUrl: String?
    let isRead: Bool
    let createdAt: String
    let updatedAt: String?
    let sender: ConversationSenderInfo?
    let metadata: ConversationMessageMetadataResponse?
    
    enum CodingKeys: String, CodingKey {
        case id
        case conversationId = "conversation_id"
        case senderId = "sender_id"
        case receiverId = "receiver_id"
        case content
        case messageType = "message_type"
        case mediaUrl = "media_url"
        case isRead = "is_read"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case sender
        case metadata
    }
}

struct ConversationSenderInfo: Codable {
    let id: Int
    let username: String?
    let displayName: String?
    let profilePicture: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case displayName = "display_name"
        case profilePicture = "profile_picture"
    }
}

struct ConversationMessageMetadataResponse: Codable {
    let imageUrl: String?
    let thumbnailUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case imageUrl = "imageUrl"
        case thumbnailUrl = "thumbnailUrl"
    }
}

// Helper to convert ConversationMessageResponse to Message
extension ConversationMessageResponse {
    func toMessage() throws -> Message {
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        guard let createdDate = dateFormatter.date(from: createdAt) else {
            throw APIError.decodingError("Invalid date format in message response")
        }
        
        let updatedDate = updatedAt.flatMap { dateFormatter.date(from: $0) }
        
        let messageMetadata = metadata.map { meta in
            MessageMetadata(
                imageUrl: meta.imageUrl,
                thumbnailUrl: meta.thumbnailUrl,
                systemMessageType: nil
            )
        }
        
        return Message(
            id: id,
            conversationId: conversationId,
            senderId: senderId,
            receiverId: receiverId,
            content: content,
            messageType: MessageType(rawValue: messageType) ?? .text,
            mediaUrl: mediaUrl,
            isRead: isRead,
            createdAt: createdDate,
            updatedAt: updatedDate,
            senderUsername: sender?.username,
            senderFirstName: nil,
            senderLastName: nil,
            senderDisplayName: sender?.displayName,
            senderProfilePicture: sender?.profilePicture,
            metadata: messageMetadata
        )
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

