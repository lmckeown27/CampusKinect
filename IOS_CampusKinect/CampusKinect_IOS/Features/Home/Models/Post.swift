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
    let isRecurring: Bool?
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
    var isRecurringComputed: Bool { isRecurring ?? (durationType == "recurring") }
    
    // MARK: - Computed Properties
    var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }
    
    var hasImages: Bool {
        return !images.isEmpty
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
    let id: Int?
    let name: String
    let city: String?
    let state: String?
}

// MARK: - Post Image Helper
extension Post {
    var imageURLs: [URL] {
        return images.compactMap { imagePath in
            URL(string: "\(APIConstants.baseURL)\(imagePath)")
        }
    }
    
    var primaryImageURL: URL? {
        return imageURLs.first
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

// MARK: - Bookmarks/Reposts Response (different structure)
struct BookmarksResponse: Codable {
    let success: Bool
    let data: [BookmarkPost]
    let pagination: BookmarkPagination
}

struct RepostsResponse: Codable {
    let success: Bool
    let data: [RepostPost]
    let pagination: RepostPagination
}

// MARK: - Bookmark/Repost Post Models
struct BookmarkPost: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let description: String
    let postType: String
    let duration: String
    let location: String?
    let tags: [String]
    let images: [String]
    let userId: String
    let universityId: String
    let isActive: Bool
    let messageCount: Int
    let shareCount: Int
    let bookmarkCount: Int
    let repostCount: Int
    let engagementScore: String
    let createdAt: Date
    let updatedAt: Date
    let bookmarkedAt: Date?
    let poster: BookmarkPoster
    let university: BookmarkUniversity
    
    // Convert to regular Post for UI compatibility
    var asPost: Post {
        return Post(
            id: Int(id) ?? 0,
            userId: Int(userId) ?? 0,
            title: title,
            description: description,
            postType: postType,
            durationType: duration,
            location: location,
            repostFrequency: nil,
            isRecurring: duration == "recurring" ? true : nil,
            originalPostId: nil,
            expiresAt: nil,
            eventStart: nil,
            eventEnd: nil,
            isFulfilled: false,
            viewCount: 0,
            createdAt: createdAt,
            updatedAt: updatedAt,
            poster: PostUser(
                id: Int(poster.id) ?? 0,
                username: poster.username,
                firstName: poster.firstName,
                lastName: poster.lastName,
                displayName: "\(poster.firstName) \(poster.lastName)",
                profilePicture: poster.profilePicture
            ),
            university: PostUniversity(
                id: Int(university.id) ?? 0,
                name: university.name,
                city: nil,
                state: nil
            ),
            images: images,
            imageCount: String(images.count),
            tags: tags
        )
    }
}

struct RepostPost: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let description: String
    let postType: String
    let duration: String
    let location: String?
    let tags: [String]
    let images: [String]
    let userId: String
    let universityId: String
    let isActive: Bool
    let messageCount: Int
    let shareCount: Int
    let bookmarkCount: Int
    let repostCount: Int
    let engagementScore: String
    let createdAt: Date
    let updatedAt: Date
    let repostedAt: Date?
    let poster: RepostPoster
    let university: RepostUniversity
    
    // Convert to regular Post for UI compatibility
    var asPost: Post {
        return Post(
            id: Int(id) ?? 0,
            userId: Int(userId) ?? 0,
            title: title,
            description: description,
            postType: postType,
            durationType: duration,
            location: location,
            repostFrequency: nil,
            isRecurring: duration == "recurring" ? true : nil,
            originalPostId: nil,
            expiresAt: nil,
            eventStart: nil,
            eventEnd: nil,
            isFulfilled: false,
            viewCount: 0,
            createdAt: createdAt,
            updatedAt: updatedAt,
            poster: PostUser(
                id: Int(poster.id) ?? 0,
                username: poster.username,
                firstName: poster.firstName,
                lastName: poster.lastName,
                displayName: "\(poster.firstName) \(poster.lastName)",
                profilePicture: poster.profilePicture
            ),
            university: PostUniversity(
                id: Int(university.id) ?? 0,
                name: university.name,
                city: nil,
                state: nil
            ),
            images: images,
            imageCount: String(images.count),
            tags: tags
        )
    }
}

// MARK: - Bookmark/Repost Supporting Models
struct BookmarkPoster: Codable, Equatable {
    let id: String
    let username: String
    let firstName: String
    let lastName: String
    let profilePicture: String?
}

struct RepostPoster: Codable, Equatable {
    let id: String
    let username: String
    let firstName: String
    let lastName: String
    let profilePicture: String?
}

struct BookmarkUniversity: Codable, Equatable {
    let id: String
    let name: String
    let domain: String?
}

struct RepostUniversity: Codable, Equatable {
    let id: String
    let name: String
    let domain: String?
}

struct BookmarkPagination: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
    
    // Computed properties for compatibility
    var pages: Int { totalPages }
    var hasNext: Bool { page < totalPages }
    var hasPrevious: Bool { page > 1 }
}

struct RepostPagination: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
    
    // Computed properties for compatibility
    var pages: Int { totalPages }
    var hasNext: Bool { page < totalPages }
    var hasPrevious: Bool { page > 1 }
}



