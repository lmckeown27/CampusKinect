//
//  MessageRequest.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - Message Request Models
struct MessageRequest: Codable, Identifiable, Equatable {
    let id: Int
    let fromUser: MessageRequestUser
    let toUser: MessageRequestUser?
    let content: String
    let postId: Int?
    let postTitle: String?
    let postType: String?
    let status: String // "pending", "accepted", "rejected", "ignored"
    let createdAt: Date
    
    // Use message content as fallback for content field
    private enum CodingKeys: String, CodingKey {
        case id, fromUser, toUser, content, postId, postTitle, postType, status, createdAt
        case message
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        fromUser = try container.decode(MessageRequestUser.self, forKey: .fromUser)
        toUser = try container.decodeIfPresent(MessageRequestUser.self, forKey: .toUser)
        
        // Try content first, then message as fallback
        if let content = try container.decodeIfPresent(String.self, forKey: .content) {
            self.content = content
        } else {
            self.content = try container.decode(String.self, forKey: .message)
        }
        
        postId = try container.decodeIfPresent(Int.self, forKey: .postId)
        postTitle = try container.decodeIfPresent(String.self, forKey: .postTitle)
        postType = try container.decodeIfPresent(String.self, forKey: .postType)
        status = try container.decode(String.self, forKey: .status)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(fromUser, forKey: .fromUser)
        try container.encodeIfPresent(toUser, forKey: .toUser)
        try container.encode(content, forKey: .content)
        try container.encodeIfPresent(postId, forKey: .postId)
        try container.encodeIfPresent(postTitle, forKey: .postTitle)
        try container.encodeIfPresent(postType, forKey: .postType)
        try container.encode(status, forKey: .status)
        try container.encode(createdAt, forKey: .createdAt)
    }
    
    var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }
}

// MARK: - Message Request User (without required id)
struct MessageRequestUser: Codable, Equatable {
    let id: Int?
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
}

// MARK: - Message Requests Response
struct MessageRequestsResponse: Codable {
    let success: Bool
    let data: MessageRequestsData
    
    struct MessageRequestsData: Codable {
        let requests: [MessageRequest]
        let pagination: PaginationInfo
    }
}

