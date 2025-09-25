import Foundation
import Combine

class AdminAPIService: ObservableObject {
    private let baseURL = "https://api.campuskinect.net/api/v1/admin" // Update with your actual API URL
    private let session = URLSession.shared
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Authentication
    private func getAuthHeaders() -> [String: String] {
        guard let token = AuthenticationManager.shared.currentToken else {
            return [:]
        }
        
        return [
            "Authorization": "Bearer \(token)",
            "Content-Type": "application/json"
        ]
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
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: APIResponse<PaginatedResponse<ContentReport>>.self, decoder: JSONDecoder())
            .compactMap { response in
                response.success ? response.data : nil
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
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: APIResponse<ModerationStats>.self, decoder: JSONDecoder())
            .compactMap { response in
                response.success ? response.data : nil
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
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: APIResponse<EmptyResponse>.self, decoder: JSONDecoder())
            .compactMap { response in
                response.success ? () : nil
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
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: APIResponse<EmptyResponse>.self, decoder: JSONDecoder())
            .compactMap { response in
                response.success ? () : nil
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

private struct EmptyResponse: Codable {}

private struct BanUserRequest: Codable {
    let reason: String
}

// MARK: - Admin Authentication Manager Extension
extension AuthenticationManager {
    var isAdminUser: Bool {
        guard let user = currentUser else { return false }
        return AdminUser.isAuthorized(email: user.email, username: user.username)
    }
} 