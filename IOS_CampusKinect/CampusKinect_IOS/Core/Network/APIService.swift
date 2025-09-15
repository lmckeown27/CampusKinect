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
    ) async throws -> AuthResponse {
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
        
        return try await performRequest(
            endpoint: APIConstants.Endpoints.posts,
            method: .POST,
            body: body,
            requiresAuth: true
        )
    }
    
    // MARK: - User Methods
    func getCurrentUser() async throws -> User {
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.users)/me",
            method: .GET,
            body: nil,
            requiresAuth: true
        )
    }
    
    func updateProfile(_ profile: UpdateProfileRequest) async throws -> User {
        let body = try encoder.encode(profile)
        
        return try await performRequest(
            endpoint: "\(APIConstants.Endpoints.users)/me",
            method: .PUT,
            body: body,
            requiresAuth: true
        )
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

