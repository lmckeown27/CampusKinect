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
    let content: String
    let category: String
    let subcategory: String?
    let location: String?
    let userId: Int
    let universityId: Int
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    // User information
    let user: PostUser
    
    // Post statistics
    let messageCount: Int
    let shareCount: Int
    let bookmarkCount: Int
    let repostCount: Int
    let engagementScore: Double
    
    // Post images
    let images: [PostImage]
    
    // Post tags
    let tags: [String]
    
    enum CodingKeys: String, CodingKey {
        case id
        case content
        case category
        case subcategory
        case location
        case userId = "user_id"
        case universityId = "university_id"
        case isActive = "is_active"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case user
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
    let displayName: String
    let profilePicture: String?
    let year: String?
    let major: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
        case profilePicture = "profile_picture"
        case year
        case major
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
    let posts: [Post]
    let pagination: PaginationInfo
    
    enum CodingKeys: String, CodingKey {
        case posts = "data"
        case pagination
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

