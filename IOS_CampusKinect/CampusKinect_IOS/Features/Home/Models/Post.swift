//
//  Post.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - Post Model
struct Post: Codable, Identifiable, Equatable {
    let id: Int
    let userId: Int
    let title: String
    let description: String
    let postType: String
    let durationType: String
    let location: String?
    let repostFrequency: String?
    let isRecurring: Bool
    let originalPostId: Int?
    let expiresAt: String?
    let eventStart: String?
    let eventEnd: String?
    let isFulfilled: Bool
    let viewCount: Int
    let createdAt: Date
    let updatedAt: Date
    
    // User information
    let poster: PostUser
    
    // University information
    let university: PostUniversity
    
    // Post images
    let images: [String]
    let imageCount: String
    
    // Post tags
    let tags: [String]
    
    // Computed properties for compatibility
    var content: String { description }
    var category: String { postType }
    var subcategory: String? { nil }
    var user: PostUser { poster }
        case messageCount = "message_count"
        case shareCount = "share_count"
        case bookmarkCount = "bookmark_count"
        case repostCount = "repost_count"
        case engagementScore = "engagement_score"
        case images
        case tags
    }
    
    // MARK: - Computed Properties
    var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }
    
    var hasImages: Bool {
        return !images.isEmpty
    }
    
    var primaryImage: PostImage? {
        return images.first
    }
    
    var categoryDisplayName: String {
        return category.capitalized
    }
    
    var subcategoryDisplayName: String? {
        return subcategory?.capitalized
    }
}

// MARK: - Post User
struct PostUser: Codable, Equatable {
    let id: Int
    let username: String
    let firstName: String
    let lastName: String
    let displayName: String
    let profilePicture: String?
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
}

// MARK: - Post University
struct PostUniversity: Codable, Equatable {
    let id: Int
    let name: String
    let city: String
    let state: String
}

// MARK: - Post Image
struct PostImage: Codable, Identifiable, Equatable {
    let id: Int
    let postId: Int
    let imageUrl: String
    let thumbnailUrl: String?
    let altText: String?
    let orderIndex: Int
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case postId = "post_id"
        case imageUrl = "image_url"
        case thumbnailUrl = "thumbnail_url"
        case altText = "alt_text"
        case orderIndex = "order_index"
        case createdAt = "created_at"
    }
    
    var fullImageURL: URL? {
        return URL(string: "\(APIConstants.baseURL)/\(imageUrl)")
    }
    
    var thumbnailImageURL: URL? {
        guard let thumbnailUrl = thumbnailUrl else { return fullImageURL }
        return URL(string: "\(APIConstants.baseURL)/\(thumbnailUrl)")
    }
}

// MARK: - Posts Response
struct PostsResponse: Codable {
    let success: Bool
    let data: PostsData
    
    struct PostsData: Codable {
        let posts: [Post]
        let pagination: PaginationInfo
    }
}

// MARK: - Create Post Request
struct CreatePostRequest: Codable {
    let content: String
    let category: String
    let subcategory: String?
    let location: String?
    let tags: [String]
    let images: [String]? // Base64 encoded images
    
    enum CodingKeys: String, CodingKey {
        case content
        case category
        case subcategory
        case location
        case tags
        case images
    }
}

