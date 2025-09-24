//
//  APIService.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - API Service
class APIService: NSObject, ObservableObject {
    static let shared = APIService()
    
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    private override init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = APIConstants.timeout
        config.timeoutIntervalForResource = APIConstants.timeout * 2
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        
        // Add performance optimizations to prevent hangs
        config.waitsForConnectivity = false
        config.allowsCellularAccess = true
        config.allowsExpensiveNetworkAccess = true
        config.allowsConstrainedNetworkAccess = true
        
        self.session = URLSession(configuration: config)
        self.decoder = JSONDecoder()
        self.encoder = JSONEncoder()
        
        // Configure date formatting
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'"
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
        decoder.dateDecodingStrategy = .formatted(dateFormatter)
        encoder.dateEncodingStrategy = .formatted(dateFormatter)
    }
    
    // MARK: - Generic Request Method
    private func performRequest<T: Codable>(
        endpoint: String,
        method: HTTPMethod = .GET,
        body: Data? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        
        let fullURL = APIConstants.fullBaseURL + endpoint
        print("🔍 Full API URL: \(fullURL)")
        print("🔍 Base URL: \(APIConstants.baseURL)")
        
        guard let url = URL(string: fullURL) else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add authentication if required
        if requiresAuth {
            if let token = await KeychainManager.shared.getAccessToken() {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            } else {
                throw APIError.unauthorized
            }
        }
        
        // Add body if provided
        if let body = body {
            request.httpBody = body
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }
            
            // Debug logging for response
            print("🔍 HTTP Status Code: \(httpResponse.statusCode)")
            if let responseString = String(data: data, encoding: .utf8) {
                print("🔍 Response Body: \(responseString)")
            }
            
            // Handle different status codes
            switch httpResponse.statusCode {
            case 200...299:
                do {
                    let result = try decoder.decode(T.self, from: data)
                    print("✅ Successfully decoded response")
                    return result
                } catch {
                    print("❌ Decoding error: \(error)")
                    if let responseString = String(data: data, encoding: .utf8) {
                        print("❌ Raw response: \(responseString)")
                    }
                    throw APIError.decodingError(error.localizedDescription)
                }
            case 401:
                // Token expired, try to refresh
                throw APIError.unauthorized
            case 400:
                if let errorResponse = try? decoder.decode(ErrorResponse.self, from: data) {
                    // Check for specific validation errors and provide user-friendly messages
                    if let details = errorResponse.error.details {
                        for detail in details {
                            if detail.field == "tags" {
                                if detail.message.contains("1 to 10 items") {
                                    throw APIError.badRequest("Please select at least one tag for your post")
                                } else {
                                    throw APIError.badRequest(detail.message)
                                }
                            }
                        }
                        // If we have validation details but none are tag-specific, use the first one
                        if let firstDetail = details.first {
                            throw APIError.badRequest(firstDetail.message)
                        }
                    }
                    // Fallback to the general error message
                    throw APIError.badRequest(errorResponse.error.message)
                }
                throw APIError.badRequest("Bad request")
            case 404:
                throw APIError.notFound
            case 500...599:
                throw APIError.serverError
            default:
                throw APIError.unknown(httpResponse.statusCode)
            }
            
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error.localizedDescription)
        }
    }
    
    // MARK: - Authentication Methods
    func login(email: String, password: String) async throws -> AuthResponse {
        // TEMPORARY FIX: Use manual dictionary to ensure correct field names
        let loginDict = ["usernameOrEmail": email, "password": password]
        let body = try JSONSerialization.data(withJSONObject: loginDict)
        
        // Debug logging to see what's being sent
        if let jsonString = String(data: body, encoding: .utf8) {
            print("🔍 Login request JSON: \(jsonString)")
        }
        print("🔍 Login request: usernameOrEmail=\(email), password=***")
        
        return try await performRequest(
            endpoint: APIConstants.Endpoints.login,
            method: .POST,
            body: body,
            requiresAuth: false
        )
    }
    
    func register(
        username: String,
        email: String,
        password: String,
        firstName: String,
        lastName: String
    ) async throws -> RegistrationResponse {
        let registerRequest = RegisterRequest(
            username: username,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        )
        let body = try encoder.encode(registerRequest)
        
        return try await performRequest(
            endpoint: APIConstants.Endpoints.register,
            method: .POST,
            body: body,
            requiresAuth: false
        )
    }
    
    func verifyEmail(email: String, code: String) async throws -> AuthResponse {
        let verifyRequest = VerifyEmailRequest(email: email, code: code)
        let body = try encoder.encode(verifyRequest)
        
        return try await performRequest(
            endpoint: APIConstants.Endpoints.verify,
            method: .POST,
            body: body,
            requiresAuth: false
        )
    }
    
    func resendVerificationCode(email: String) async throws -> MessageResponse {
        let resendRequest = ResendCodeRequest(email: email)
        let body = try encoder.encode(resendRequest)
        
        return try await performRequest(
            endpoint: APIConstants.Endpoints.resendCode,
            method: .POST,
            body: body,
            requiresAuth: false
        )
    }
    
    // MARK: - Posts Methods
    func fetchPosts(page: Int = 1, limit: Int = 20) async throws -> PostsResponse {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.posts)?page=\(page)&limit=\(limit)",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }
    
    func createPost(_ post: CreatePostRequest) async throws -> Post {
        let body = try encoder.encode(post)
        
        let response: CreatePostResponse = try await performRequest(
            endpoint: APIConstants.Endpoints.posts,
            method: .POST,
            body: body,
            requiresAuth: true
        )
        
        return response.data.post
    }
    
    func deletePost(_ postId: Int) async throws {
        let _: EmptyResponse = try await performRequest(
            endpoint: "\(APIConstants.Endpoints.posts)/\(postId)",
            method: .DELETE,
            body: nil,
            requiresAuth: true
        )
    }
    
    func toggleBookmark(_ postId: Int) async throws -> BookmarkToggleResponse {
        // First, get current user interactions to determine if we should add or remove
        let userInteractions = try await getUserInteractions(postId)
        let isCurrentlyBookmarked = userInteractions.data.hasBookmarked
        
        let body = try encoder.encode(["interactionType": "bookmark"])
        
        if isCurrentlyBookmarked {
            // Remove bookmark
            let response: BookmarkToggleResponse = try await performRequest(
                endpoint: "\(APIConstants.Endpoints.posts)/\(postId)/interact",
                method: .DELETE,
                body: body,
                requiresAuth: true
            )
            return response
        } else {
            // Add bookmark
            let response: BookmarkToggleResponse = try await performRequest(
                endpoint: "\(APIConstants.Endpoints.posts)/\(postId)/interact",
                method: .POST,
                body: body,
                requiresAuth: true
            )
            return response
        }
    }
    
    func toggleRepost(_ postId: Int) async throws -> RepostToggleResponse {
        // First, get current user interactions to determine if we should add or remove
        let userInteractions = try await getUserInteractions(postId)
        let isCurrentlyReposted = userInteractions.data.hasReposted
        
        let body = try encoder.encode(["interactionType": "repost"])
        
        if isCurrentlyReposted {
            // Remove repost
            let response: RepostToggleResponse = try await performRequest(
                endpoint: "\(APIConstants.Endpoints.posts)/\(postId)/interact",
                method: .DELETE,
                body: body,
                requiresAuth: true
            )
            return response
        } else {
            // Add repost
            let response: RepostToggleResponse = try await performRequest(
                endpoint: "\(APIConstants.Endpoints.posts)/\(postId)/interact",
                method: .POST,
                body: body,
                requiresAuth: true
            )
            return response
        }
    }
    
    func getUserInteractions(_ postId: Int) async throws -> UserInteractionsResponse {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.posts)/\(postId)/user-interactions",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }
    
    func uploadImages(_ images: [Data]) async throws -> [String] {
        guard let url = URL(string: "\(APIConstants.fullBaseURL)/upload/images") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        // Add auth token
        if let token = await KeychainManager.shared.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Create multipart form data
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        
        for (index, imageData) in images.enumerated() {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"images\"; filename=\"image\(index).jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(imageData)
            body.append("\r\n".data(using: .utf8)!)
        }
        
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        print("🔍 Image upload HTTP Status Code: \(httpResponse.statusCode)")
        
        guard 200...299 ~= httpResponse.statusCode else {
            if httpResponse.statusCode == 401 {
                throw APIError.unauthorized
            }
            throw APIError.serverError
        }
        
        let uploadResponse = try decoder.decode(ImageUploadResponse.self, from: data)
        
        if uploadResponse.success, let imageData = uploadResponse.data {
            return imageData.images.map { $0.url }
        } else {
            throw APIError.serverError
        }
    }
    
    // MARK: - User Methods
    func getCurrentUser() async throws -> User {
        let response: UserResponse = try await performRequest(
            endpoint: "\(APIConstants.Endpoints.auth)/me",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
        return response.data.user
    }
    
    func updateProfile(_ profile: UpdateProfileRequest, currentUser: User) async throws -> User {
        let body = try encoder.encode(profile)
        
        let response: ProfileUpdateResponse = try await performRequest(
            endpoint: "\(APIConstants.Endpoints.users)/profile",
            method: .PUT,
            body: body,
            requiresAuth: true
        )
        
        return response.data.user.mergeWith(existingUser: currentUser)
    }
    
    func updateProfilePicture(_ imageUrl: String, currentUser: User) async throws -> User {
        let request = UpdateProfilePictureRequest(profilePictureUrl: imageUrl)
        let body = try encoder.encode(request)
        
        let response: ProfileUpdateResponse = try await performRequest(
            endpoint: "\(APIConstants.Endpoints.users)/profile-picture",
            method: .PUT,
            body: body,
            requiresAuth: true
        )
        
        return response.data.user.mergeWith(existingUser: currentUser)
    }
    
    // MARK: - Messages Methods
    func fetchConversations(page: Int = 1, limit: Int = 20) async throws -> ConversationsResponse {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.messages)/conversations?page=\(page)&limit=\(limit)",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }
    
    func fetchMessageRequests(page: Int = 1, limit: Int = 20) async throws -> MessageRequestsResponse {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.messages)/requests?page=\(page)&limit=\(limit)",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }
    
    func fetchSentMessageRequests(page: Int = 1, limit: Int = 20) async throws -> MessageRequestsResponse {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.messages)/requests/sent?page=\(page)&limit=\(limit)",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }
    
    // MARK: - Chat Methods
    func fetchMessages(conversationId: Int, page: Int = 1, limit: Int = 50) async throws -> MessagesResponse {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.messages)/conversations/\(conversationId)/messages?page=\(page)&limit=\(limit)",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }
    
    func sendMessage(conversationId: Int, content: String, messageType: MessageType = .text) async throws -> MessageResponse {
        let request = SendMessageToConversationRequest(
            content: content,
            messageType: messageType,
            mediaUrl: nil
        )
        let body = try encoder.encode(request)
        
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.messages)/conversations/\(conversationId)/messages",
            method: .POST,
            body: body,
            requiresAuth: true
        )
    }
    
    func createConversation(receiverId: Int, initialMessage: String) async throws -> CreateConversationResponse {
        let request = CreateConversationRequest(
            otherUserId: receiverId,
            initialMessage: initialMessage
        )
        let body = try encoder.encode(request)
        
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.messages)/conversations",
            method: .POST,
            body: body,
            requiresAuth: true
        )
    }
    
    func deleteConversation(conversationId: Int) async throws {
        let _: EmptyResponse = try await performRequest(
            endpoint: "\(APIConstants.Endpoints.messages)/conversations/\(conversationId)",
            method: .DELETE,
            body: nil,
            requiresAuth: true
        )
    }
    
    func getUserById(userId: Int) async throws -> User {
        let response: UserByIdResponse = try await performRequest(
            endpoint: "\(APIConstants.Endpoints.users)/\(userId)",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
        return response.data
    }
    
    // MARK: - User Methods
    func fetchUserPosts(userId: Int, page: Int = 1, limit: Int = 20) async throws -> PostsResponse {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.users)/\(userId)/posts?page=\(page)&limit=\(limit)",
            method: .GET,
            body: nil,
            requiresAuth: false
        )
    }
    
    func fetchUserBookmarks(page: Int = 1, limit: Int = 20) async throws -> BookmarksResponse {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.posts)/user/bookmarks?page=\(page)&limit=\(limit)",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }
    
    func fetchUserReposts(page: Int = 1, limit: Int = 20) async throws -> RepostsResponse {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.posts)/user/reposts?page=\(page)&limit=\(limit)",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }
    
    func fetchUsers(search: String? = nil) async throws -> UsersResponse {
        var endpoint = "/search/users"
        if let search = search, !search.isEmpty {
            endpoint += "?query=\(search.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        } else {
            // For empty search, get all users (or we might need a different endpoint)
            endpoint += "?query="
        }
        
        print("🔍 Fetching users from endpoint: \(APIConstants.fullBaseURL)\(endpoint)")
        
        return try await performRequest(
            endpoint: endpoint,
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }

}

// MARK: - Notification Methods
extension APIService {
    func registerDeviceToken(token: String, platform: String) async throws -> EmptyResponse {
        let request = DeviceTokenRequest(deviceToken: token, platform: platform)
        let body = try encoder.encode(request)
        
        return try await performRequest(
            endpoint: "/notifications/register-device",
            method: .POST,
            body: body,
            requiresAuth: true
        )
    }
    
    func unregisterDeviceToken(token: String) async throws -> EmptyResponse {
        let request = UnregisterDeviceTokenRequest(deviceToken: token)
        let body = try encoder.encode(request)
        
        return try await performRequest(
            endpoint: "/notifications/unregister-device",
            method: .DELETE,
            body: body,
            requiresAuth: true
        )
    }
    
    func getUnreadMessageCount() async throws -> Int {
        let response: UnreadCountResponse = try await performRequest(
            endpoint: "\(APIConstants.Endpoints.messages)/unread-count",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
        return response.data.count
    }
    
    // MARK: - Content Moderation & Safety
    
    /// Report objectionable content
    func reportContent(contentId: Int, contentType: String, reason: String, details: String?) async throws -> Bool {
        let request = ReportContentRequest(
            contentId: contentId,
            contentType: contentType,
            reason: reason,
            details: details
        )
        
        let body = try encoder.encode(request)
        let response: MessageResponse = try await performRequest(
            endpoint: "/reports",
            method: .POST,
            body: body
        )
        
        return response.success
    }
    
    /// Block a user
    func blockUser(userId: Int) async throws -> Bool {
        let request = BlockUserRequest(userId: userId)
        let body = try encoder.encode(request)
        
        let response: MessageResponse = try await performRequest(
            endpoint: "/users/block",
            method: .POST,
            body: body
        )
        
        return response.success
    }
    
    /// Unblock a user
    func unblockUser(userId: Int) async throws -> Bool {
        let request = BlockUserRequest(userId: userId)
        let body = try encoder.encode(request)
        
        let response: MessageResponse = try await performRequest(
            endpoint: "/users/unblock",
            method: .POST,
            body: body
        )
        
        return response.success
    }
    
    /// Get list of blocked users
    func getBlockedUsers() async throws -> [BlockedUser] {
        let response: BlockedUsersResponse = try await performRequest(
            endpoint: "/users/blocked"
        )
        
        return response.data
    }
}

// MARK: - Notification Request/Response Models
struct DeviceTokenRequest: Codable {
    let deviceToken: String
    let platform: String
}

struct UnregisterDeviceTokenRequest: Codable {
    let deviceToken: String
}

struct UnreadCountResponse: Codable {
    let success: Bool
    let data: UnreadCountData
    
    struct UnreadCountData: Codable {
        let count: Int
    }
}

// MARK: - HTTP Methods
enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
    case PATCH = "PATCH"
}

// MARK: - Helper Request Models
private struct VerifyEmailRequest: Codable {
    let email: String
    let code: String
}



struct MessageResponse: Codable {
    let success: Bool
    let message: String
}

struct UserByIdResponse: Codable {
    let success: Bool
    let data: User
}

struct UserResponse: Codable {
    let success: Bool
    let data: UserData
    
    struct UserData: Codable {
        let user: User
    }
}

struct SendMessageToConversationRequest: Codable {
    let content: String
    let messageType: MessageType
    let mediaUrl: String?
}

// MARK: - Content Moderation Request/Response Models

struct ReportContentRequest: Codable {
    let contentId: Int
    let contentType: String
    let reason: String
    let details: String?
}

struct BlockUserRequest: Codable {
    let userId: Int
}

struct BlockedUsersResponse: Codable {
    let success: Bool
    let data: [BlockedUser]
}


