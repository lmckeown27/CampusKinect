import Foundation
import Combine

class AdminAPIService: ObservableObject {
    private let baseURL = "\(APIConstants.fullBaseURL)/admin" // Use same base URL as main API service
    private let session = URLSession.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        print("🔍 AdminAPI: Initialized with base URL: \(baseURL)")
        print("🔍 AdminAPI: Cache policy set to reloadIgnoringLocalAndRemoteCacheData for all requests")
    }
    
    // MARK: - Authentication
    private func getAuthHeaders() -> [String: String] {
        // For now, return basic headers - token will be added in each method
        return [
            "Content-Type": "application/json"
        ]
    }
    
    private func addAuthToken(to request: URLRequest) -> AnyPublisher<URLRequest, Error> {
        return Future { promise in
            Task {
                print("🔐 AdminAPI: Getting access token from keychain...")
                if let token = await KeychainManager.shared.getAccessToken() {
                    print("✅ AdminAPI: Got access token (length: \(token.count))")
                    var authenticatedRequest = request
                    authenticatedRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                    promise(.success(authenticatedRequest))
                } else {
                    print("❌ AdminAPI: No access token found in keychain")
                    promise(.failure(URLError(.userAuthenticationRequired)))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Get Pending Reports
    func getPendingReports(page: Int = 1, limit: Int = 20) -> AnyPublisher<PaginatedResponse<ContentReport>, Error> {
        guard let url = URL(string: "\(baseURL)/reports/pending?page=\(page)&limit=\(limit)") else {
            print("❌ AdminAPI: Invalid URL for pending reports")
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        print("🔍 AdminAPI: Requesting pending reports from: \(url)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData // Disable caching for admin data
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                print("🔍 AdminAPI: Making authenticated request for pending reports")
                print("🔍 AdminAPI: Request URL: \(authenticatedRequest.url?.absoluteString ?? "nil")")
                print("🔍 AdminAPI: Request headers: \(authenticatedRequest.allHTTPHeaderFields ?? [:])")
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .handleEvents(
                        receiveOutput: { data, response in
                            if let httpResponse = response as? HTTPURLResponse {
                                print("🔍 AdminAPI: Pending reports response status: \(httpResponse.statusCode)")
                                if httpResponse.statusCode == 304 {
                                    print("⚠️ AdminAPI: Received 304 Not Modified - cache issue detected!")
                                }
                                if let dataString = String(data: data, encoding: .utf8) {
                                    print("🔍 AdminAPI: Pending reports response data: \(dataString)")
                                }
                            }
                        },
                        receiveCompletion: { completion in
                            if case .failure(let error) = completion {
                                print("❌ AdminAPI: Pending reports request failed: \(error)")
                            }
                        }
                    )
                    .map(\.data)
                    .decode(type: APIResponse<PendingReportsResponse>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        print("✅ AdminAPI: Decoded pending reports response, success: \(response.success)")
                        if response.success, let reportsData = response.data {
                            print("📊 AdminAPI: Reports data - count: \(reportsData.data.count)")
                            print("📄 AdminAPI: Pagination - page: \(reportsData.pagination.page), total: \(reportsData.pagination.total)")
                            // Convert to PaginatedResponse format expected by the app
                            let paginatedResponse = PaginatedResponse(
                                success: true,
                                data: reportsData.data,
                                pagination: reportsData.pagination,
                                message: response.message
                            )
                            print("🔄 AdminAPI: Returning PaginatedResponse with \(paginatedResponse.data.count) reports")
                            return paginatedResponse
                        } else {
                            print("❌ AdminAPI: Response not successful or data is nil")
                            print("❌ AdminAPI: Response success: \(response.success)")
                            print("❌ AdminAPI: Response data: \(String(describing: response.data))")
                        }
                        return nil
                    }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Get Moderation Statistics
    func getModerationStats() -> AnyPublisher<ModerationStats, Error> {
        guard let url = URL(string: "\(baseURL)/moderation/stats") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData // Disable caching for admin data
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .map(\.data)
                    .decode(type: APIResponse<ModerationStats>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        response.success ? response.data : nil
                    }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Moderate Report
    func moderateReport(reportId: String, action: ModerationAction) -> AnyPublisher<Void, Error> {
        guard let url = URL(string: "\(baseURL)/reports/\(reportId)/moderate") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        do {
            request.httpBody = try JSONEncoder().encode(action)
        } catch {
            return Fail(error: error)
                .eraseToAnyPublisher()
        }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .map(\.data)
                    .decode(type: APIResponse<AdminEmptyResponse>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        response.success ? () : nil
                    }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Ban User
    func banUser(userId: String, reason: String) -> AnyPublisher<Void, Error> {
        guard let url = URL(string: "\(baseURL)/users/\(userId)/ban") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        let banRequest = BanUserRequest(reason: reason)
        
        do {
            request.httpBody = try JSONEncoder().encode(banRequest)
        } catch {
            return Fail(error: error)
                .eraseToAnyPublisher()
        }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .map(\.data)
                    .decode(type: APIResponse<AdminEmptyResponse>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        response.success ? () : nil
                    }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Get Analytics Data
    func getAnalyticsData() -> AnyPublisher<AnalyticsData, Error> {
        guard let url = URL(string: "\(baseURL)/analytics") else {
            print("❌ AdminAPI: Invalid URL for analytics")
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        print("🔍 AdminAPI: Requesting analytics from: \(url)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData // Disable caching for admin data
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                print("🔍 AdminAPI: Making authenticated request for analytics")
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .handleEvents(
                        receiveOutput: { data, response in
                            if let httpResponse = response as? HTTPURLResponse {
                                print("🔍 AdminAPI: Analytics response status: \(httpResponse.statusCode)")
                                if httpResponse.statusCode == 304 {
                                    print("⚠️ AdminAPI: Received 304 Not Modified - cache issue detected!")
                                }
                                if let dataString = String(data: data, encoding: .utf8) {
                                    print("🔍 AdminAPI: Analytics response data: \(dataString)")
                                }
                            }
                        },
                        receiveCompletion: { completion in
                            if case .failure(let error) = completion {
                                print("❌ AdminAPI: Analytics request failed: \(error)")
                            }
                        }
                    )
                    .map(\.data)
                    .decode(type: APIResponse<AnalyticsData>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        print("✅ AdminAPI: Decoded analytics response, success: \(response.success)")
                        return response.success ? response.data : nil
                    }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Get Banned Users
    func getBannedUsers() -> AnyPublisher<[BannedUser], Error> {
        guard let url = URL(string: "\(baseURL)/users/banned") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData // Disable caching for admin data
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .map(\.data)
                    .decode(type: APIResponse<BannedUsersResponse>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        response.success ? response.data?.users : nil
                    }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Unban User
    func unbanUser(userId: String) -> AnyPublisher<Void, Error> {
        guard let url = URL(string: "\(baseURL)/users/\(userId)/unban") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .map(\.data)
                    .decode(type: APIResponse<AdminEmptyResponse>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        response.success ? () : nil
                    }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Admin Delete Post
    func deletePost(postId: String) -> AnyPublisher<Void, Error> {
        guard let url = URL(string: "\(baseURL)/posts/\(postId)") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .map(\.data)
                    .decode(type: APIResponse<AdminEmptyResponse>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        response.success ? () : nil
                    }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    // MARK: - Admin Ban User
    func banUserAdmin(userId: Int, reason: String) -> AnyPublisher<Void, Error> {
        guard let url = URL(string: "\(baseURL)/users/\(userId)/ban") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        let body = BanUserRequest(reason: reason)
        request.httpBody = try? JSONEncoder().encode(body)
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .map(\.data)
                    .decode(type: APIResponse<AdminEmptyResponse>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        response.success ? () : nil
                    }
            }
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}

// MARK: - Supporting Models
private struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let message: String?
}

private struct AdminEmptyResponse: Codable {}

private struct BanUserRequest: Codable {
    let reason: String
}

private struct BannedUsersResponse: Codable {
    let users: [BannedUser]
}

private struct PendingReportsResponse: Codable {
    let data: [ContentReport]
    let pagination: PaginationInfo
}

// MARK: - Admin Authentication Manager Extension
extension AuthenticationManager {
    var isAdminUser: Bool {
        guard let user = currentUser else { return false }
        return AdminUser.isAuthorized(email: user.email, username: user.username)
    }
} 