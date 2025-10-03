import Foundation

// MARK: - Universities Response (from /search/universities)
struct UniversitiesResponse: Codable {
    let success: Bool
    let data: UniversitiesData
}

struct UniversitiesData: Codable {
    let universities: [UniversitySearchResult]
    let searchQuery: String?
}

struct UniversitySearchResult: Codable, Identifiable {
    let id: Int
    let name: String
    let domain: String?
    let city: String?
    let state: String?
    let country: String?
    let location: UniversityLocation?
    let cluster: String?
    let userCount: Int
    
    enum CodingKeys: String, CodingKey {
        case id, name, domain, city, state, country, location, cluster
        case userCount = "userCount"
    }
}

struct UniversityLocation: Codable {
    let latitude: Double?
    let longitude: Double?
}

