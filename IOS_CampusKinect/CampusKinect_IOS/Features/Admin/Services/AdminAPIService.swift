import Foundation
import Combine

class AdminAPIService: ObservableObject {
    private let baseURL = "https://api.campuskinect.net/api/v1/admin" // Update with your actual API URL
    private let session = URLSession.shared
    private var cancellables = Set<AnyCancellable>()
    
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
                if let token = await KeychainManager.shared.getAccessToken() {
                    var authenticatedRequest = request
                    authenticatedRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                    promise(.success(authenticatedRequest))
                } else {
                    promise(.failure(URLError(.userAuthenticationRequired)))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Get Pending Reports
    func getPendingReports(page: Int = 1, limit: Int = 20) -> AnyPublisher<PaginatedResponse<ContentReport>, Error> {
        guard let url = URL(string: "\(baseURL)/reports/pending?page=\(page)&limit=\(limit)") else {
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .map(\.data)
                    .decode(type: PaginatedResponse<ContentReport>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        response.success ? response : nil
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
            return Fail(error: URLError(.badURL))
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        getAuthHeaders().forEach { request.setValue($1, forHTTPHeaderField: $0) }
        
        return addAuthToken(to: request)
            .flatMap { authenticatedRequest in
                return self.session.dataTaskPublisher(for: authenticatedRequest)
                    .map(\.data)
                    .decode(type: APIResponse<AnalyticsData>.self, decoder: JSONDecoder())
                    .compactMap { response in
                        response.success ? response.data : nil
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

// MARK: - Admin Authentication Manager Extension
extension AuthenticationManager {
    var isAdminUser: Bool {
        guard let user = currentUser else { return false }
        return AdminUser.isAuthorized(email: user.email, username: user.username)
    }
} 