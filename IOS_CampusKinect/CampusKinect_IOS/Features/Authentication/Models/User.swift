import Foundation

// MARK: - User Model
struct User: Codable, Identifiable, Equatable {
    let id: Int
    let username: String?
    let email: String?
    let firstName: String
    let lastName: String
    let displayName: String
    let profilePicture: String?
    let year: String?
    let major: String?
    let hometown: String?
    let bio: String?
    let universityId: Int?
    let universityName: String?
    let universityDomain: String?
    let isVerified: Bool?
    let isActive: Bool?
    let createdAt: Date?
    let updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case username
        case email
        case firstName
        case lastName
        case displayName
        case profilePicture
        case year
        case major
        case hometown
        case bio
        case universityId
        case universityName
        case universityDomain
        case isVerified
        case isActive
        case createdAt
        case updatedAt
        case university
    }
    
    // Nested university structure for getUserById response
    struct UniversityInfo: Codable {
        let id: Int
        let name: String
        let city: String?
        let state: String?
    }
    
    // Memberwise initializer for creating User instances programmatically
    init(id: Int, username: String?, email: String?, firstName: String, lastName: String, displayName: String, profilePicture: String?, year: String?, major: String?, hometown: String?, bio: String?, universityId: Int?, universityName: String?, universityDomain: String?, isVerified: Bool?, isActive: Bool?, createdAt: Date, updatedAt: Date?) {
        self.id = id
        self.username = username
        self.email = email
        self.firstName = firstName
        self.lastName = lastName
        self.displayName = displayName
        self.profilePicture = profilePicture
        self.year = year
        self.major = major
        self.hometown = hometown
        self.bio = bio
        self.universityId = universityId
        self.universityName = universityName
        self.universityDomain = universityDomain
        self.isVerified = isVerified
        self.isActive = isActive
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(Int.self, forKey: .id)
        username = try container.decodeIfPresent(String.self, forKey: .username)
        email = try container.decodeIfPresent(String.self, forKey: .email)
        firstName = try container.decode(String.self, forKey: .firstName)
        lastName = try container.decode(String.self, forKey: .lastName)
        displayName = try container.decode(String.self, forKey: .displayName)
        profilePicture = try container.decodeIfPresent(String.self, forKey: .profilePicture)
        year = try container.decodeIfPresent(String.self, forKey: .year)
        major = try container.decodeIfPresent(String.self, forKey: .major)
        hometown = try container.decodeIfPresent(String.self, forKey: .hometown)
        bio = try container.decodeIfPresent(String.self, forKey: .bio)
        isVerified = try container.decodeIfPresent(Bool.self, forKey: .isVerified)
        isActive = try container.decodeIfPresent(Bool.self, forKey: .isActive)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        updatedAt = try container.decodeIfPresent(Date.self, forKey: .updatedAt)
        
        // Handle university fields - try nested university object first, then individual fields
        if let universityInfo = try? container.decodeIfPresent(UniversityInfo.self, forKey: .university) {
            universityId = universityInfo.id
            universityName = universityInfo.name
            universityDomain = nil // Not provided in nested structure
        } else {
            universityId = try container.decodeIfPresent(Int.self, forKey: .universityId)
            universityName = try container.decodeIfPresent(String.self, forKey: .universityName)
            universityDomain = try container.decodeIfPresent(String.self, forKey: .universityDomain)
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        try container.encode(id, forKey: .id)
        try container.encodeIfPresent(username, forKey: .username)
        try container.encodeIfPresent(email, forKey: .email)
        try container.encode(firstName, forKey: .firstName)
        try container.encode(lastName, forKey: .lastName)
        try container.encode(displayName, forKey: .displayName)
        try container.encodeIfPresent(profilePicture, forKey: .profilePicture)
        try container.encodeIfPresent(year, forKey: .year)
        try container.encodeIfPresent(major, forKey: .major)
        try container.encodeIfPresent(hometown, forKey: .hometown)
        try container.encodeIfPresent(bio, forKey: .bio)
        try container.encodeIfPresent(universityId, forKey: .universityId)
        try container.encodeIfPresent(universityName, forKey: .universityName)
        try container.encodeIfPresent(universityDomain, forKey: .universityDomain)
        try container.encodeIfPresent(isVerified, forKey: .isVerified)
        try container.encodeIfPresent(isActive, forKey: .isActive)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encodeIfPresent(updatedAt, forKey: .updatedAt)
    }
    
    // MARK: - Computed Properties
    var fullName: String {
        return "\(firstName) \(lastName)"
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
    
    // MARK: - Helper Methods
    func hasCompleteProfile() -> Bool {
        return year != nil && major != nil && hometown != nil
    }
}

// MARK: - Update Profile Request
struct UpdateProfileRequest: Codable {
    let username: String?
    let displayName: String?
    let firstName: String?
    let lastName: String?
    let year: String?
    let major: String?
    let hometown: String?
    let bio: String?
    
    enum CodingKeys: String, CodingKey {
        case username
        case displayName
        case firstName
        case lastName
        case year
        case major
        case hometown
        case bio
    }
}

// MARK: - Update Profile Picture Request
struct UpdateProfilePictureRequest: Codable {
    let profilePictureUrl: String
}

// MARK: - Profile Update Response Models
struct ProfileUpdateResponse: Codable {
    let success: Bool
    let message: String
    let data: ProfileUpdateData
}

struct ProfileUpdateData: Codable {
    let user: PartialUser
}

// Partial user model for profile update responses
struct PartialUser: Codable {
    let id: Int
    let firstName: String?
    let lastName: String?
    let displayName: String?
    let profilePicture: String?
    let year: String?
    let major: String?
    let hometown: String?
    let bio: String?
    let updatedAt: String?
    
    // Convert to full User by merging with existing user data
    func mergeWith(existingUser: User) -> User {
        return User(
            id: id,
            username: existingUser.username,
            email: existingUser.email,
            firstName: firstName ?? existingUser.firstName,
            lastName: lastName ?? existingUser.lastName,
            displayName: displayName ?? existingUser.displayName,
            profilePicture: profilePicture ?? existingUser.profilePicture,
            year: year ?? existingUser.year,
            major: major ?? existingUser.major,
            hometown: hometown ?? existingUser.hometown,
            bio: bio ?? existingUser.bio,
            universityId: existingUser.universityId,
            universityName: existingUser.universityName,
            universityDomain: existingUser.universityDomain,
            isVerified: existingUser.isVerified,
            isActive: existingUser.isActive,
            createdAt: existingUser.createdAt ?? Date(),
            updatedAt: updatedAt ?? existingUser.updatedAt
        )
    }
}

// MARK: - University Model
struct University: Codable, Identifiable {
    let id: Int
    let name: String
    let domain: String
    let timezone: String?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case domain
        case timezone
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Users Response
struct UsersResponse: Codable {
    let success: Bool
    let data: UsersData
    let message: String?
}

struct UsersData: Codable {
    let users: [SearchUser]
    let pagination: UsersPagination?
    let searchQuery: String?
}

struct UsersPagination: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
    
    enum CodingKeys: String, CodingKey {
        case page
        case limit
        case total
        case totalPages = "pages"  // API returns "pages" but we want "totalPages"
    }
    
    var pages: Int { totalPages }
    var hasNext: Bool { page < totalPages }
    var hasPrevious: Bool { page > 1 }
}

// MARK: - Search User Model (for search API responses)
struct SearchUser: Codable, Identifiable, Equatable {
    let id: Int
    let username: String?
    let firstName: String
    let lastName: String
    let displayName: String
    let profilePicture: String?
    let year: String?
    let major: String?
    let hometown: String?
    let createdAt: Date?
    let university: SearchUniversity?
    let postCount: String?
    let relevance: Double?
    
    // Convert to User for compatibility
    var asUser: User {
        return User(
            id: id,
            username: username,
            email: "", // Search results don't include email for privacy
            firstName: firstName,
            lastName: lastName,
            displayName: displayName,
            profilePicture: profilePicture,
            year: year,
            major: major,
            hometown: hometown,
            bio: nil,
            universityId: university?.id ?? 0,
            universityName: university?.name,
            universityDomain: nil,
            isVerified: false, // Not provided in search results
            isActive: true, // Assume active if in search results
            createdAt: createdAt ?? Date(), // Use current date if not provided
            updatedAt: nil
        )
    }
    
    // Computed properties for UI compatibility
    var initials: String {
        let firstInitial = firstName.first?.uppercased() ?? ""
        let lastInitial = lastName.first?.uppercased() ?? ""
        return "\(firstInitial)\(lastInitial)"
    }
}

struct SearchUniversity: Codable, Equatable {
    let name: String
    let city: String?
    let state: String?
    
    var id: Int { 0 } // Not provided in search results
}

