import Foundation

// MARK: - User Model
struct User: Codable, Identifiable, Equatable {
    let id: Int
    let email: String
    let firstName: String
    let lastName: String
    let displayName: String
    let profilePicture: String?
    let year: String?
    let major: String?
    let hometown: String?
    let bio: String?
    let universityId: Int
    let isVerified: Bool
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case firstName = "first_name"
        case lastName = "last_name"
        case displayName = "display_name"
        case profilePicture = "profile_picture"
        case year
        case major
        case hometown
        case bio
        case universityId = "university_id"
        case isVerified = "is_verified"
        case isActive = "is_active"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
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
    let firstName: String?
    let lastName: String?
    let displayName: String?
    let year: String?
    let major: String?
    let hometown: String?
    let bio: String?
    
    enum CodingKeys: String, CodingKey {
        case firstName = "first_name"
        case lastName = "last_name"
        case displayName = "display_name"
        case year
        case major
        case hometown
        case bio
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

