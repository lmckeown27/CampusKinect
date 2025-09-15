//
//  PaginationModel.swift
//  CampusKinect_IOS
//
//  Created by Liam McKeown on 9/12/25.
//

import Foundation

// MARK: - Pagination Info
struct PaginationInfo: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let pages: Int
    
    // Computed properties for backward compatibility
    var currentPage: Int { page }
    var totalPages: Int { pages }
    var totalCount: Int { total }
    var hasNext: Bool { page < pages }
    var hasPrevious: Bool { page > 1 }
}

// MARK: - Paginated Response
struct PaginatedResponse<T: Codable>: Codable {
    let success: Bool
    let data: [T]
    let pagination: PaginationInfo
    let message: String?
    
    enum CodingKeys: String, CodingKey {
        case success
        case data
        case pagination
        case message
    }
}

